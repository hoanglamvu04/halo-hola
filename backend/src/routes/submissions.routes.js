import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { lookupRateLimiter, submissionRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import { submissionSchema, lookupSchema } from '../validators/submission.validators.js';
import { createSubmission, getPublicStats, getHaloPublicMediaUrl } from '../services/submission.service.js';
import { getSubmissionOperationalState } from '../services/submissionOperations.service.js';
import { confirmFacebookSubmission } from '../services/facebookCompletion.service.js';
import { sendSubmissionReceived } from '../services/mail.service.js';
import { verifyToken } from '../utils/jwt.js';
import { pool } from '../database/pool.js';

const router = Router();

const FILE_EXTENSIONS_BY_TYPE = {
  Photo: new Set(['.jpg','.jpeg','.png','.webp','.tif','.tiff','.dng','.cr2','.nef','.arw']),
  Video: new Set(['.mp4','.mov']),
  'Story & Creative': new Set(['.pdf','.doc','.docx','.mp3']),
  'Art & Design': new Set(['.jpg','.jpeg','.png','.webp','.tif','.tiff','.pdf','.dng','.cr2','.nef','.arw'])
};

function hasAdminPreview(req) {
  const header=String(req.headers.authorization||'');
  if(!header.startsWith('Bearer ')) return false;
  try {
    const user=verifyToken(header.slice(7));
    return ['ADMIN','MODERATOR'].includes(user?.role);
  } catch {
    return false;
  }
}

function validateFilesForArtworkType(type, files = []) {
  if (!files.length) return;
  const allowed = FILE_EXTENSIONS_BY_TYPE[type];
  if (!allowed) throw new AppError('Loại hình tác phẩm chưa được hỗ trợ.', 400);

  const invalid = files.filter((file) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    return !allowed.has(ext);
  });

  if (invalid.length) {
    const names = invalid.map((file) => file.originalname).filter(Boolean).join(', ');
    throw new AppError(`Loại hình ${type} không nhận tệp: ${names}. Vui lòng chọn đúng định dạng tác phẩm.`, 400);
  }
}

router.get('/stats', async (req, res, next) => {
  try {
    if (hasAdminPreview(req)) {
      const { rows }=await pool.query(`
        SELECT
          COUNT(*)::int AS submissions,
          COUNT(DISTINCT email)::int AS creators,
          COUNT(DISTINCT NULLIF(location,''))::int AS locations,
          COUNT(*) FILTER (WHERE status IN ('TOP52','AWARDED'))::int AS top52
        FROM submissions
        WHERE code LIKE 'HH26-SHOW%'
      `);
      const preview=rows[0];
      if (preview?.submissions) return res.json({ ...preview, preview: true });
    }
    res.json(await getPublicStats());
  } catch (error) {
    next(error);
  }
});

router.get('/lookup', lookupRateLimiter, async (req, res, next) => {
  try {
    const { code, email } = lookupSchema.parse(req.query);
    const item = await getSubmissionOperationalState(code, email);
    if (!item) throw new AppError('Không tìm thấy bài dự thi với mã và email này.', 404);
    res.set('Cache-Control','no-store');
    res.json(item);
  } catch (error) {
    if (error?.name === 'ZodError') {
      return next(new AppError('Mã dự thi hoặc email chưa hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

router.post('/facebook-complete', lookupRateLimiter, async (req, res, next) => {
  try {
    const code = String(req.body?.code || '').trim();
    const email = String(req.body?.email || '').trim();
    const facebookPostUrl = String(req.body?.facebookPostUrl || '').trim();

    if (!/^HH26-[A-Z0-9-]{3,}$/i.test(code) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError('Mã dự thi hoặc email chưa hợp lệ.', 400);
    }
    if (!facebookPostUrl) throw new AppError('Cần dán link bài Facebook để hoàn tất bài dự thi.', 400);

    const confirmed = await confirmFacebookSubmission({ code, email, facebookPostUrl });
    if (!confirmed) throw new AppError('Không thể xác nhận. Hãy kiểm tra mã, email và link bài Facebook.', 400);

    res.set('Cache-Control','no-store');
    res.json({
      ok: true,
      code: confirmed.code,
      facebookPostUrl: confirmed.facebookPostUrl,
      facebookCompletionStatus: confirmed.facebookCompletionStatus,
      facebookCompletedAt: confirmed.facebookCompletedAt
    });
  } catch (error) {
    next(error);
  }
});

// Stable public HALO media URL. Media is only exposed after the submission is
// eligible and effectively published; private R2 originals stay protected.
router.get('/media/:mediaId/halo', async (req, res, next) => {
  try {
    const item = await getHaloPublicMediaUrl(req.params.mediaId);
    if (!item?.url) throw new AppError('Ảnh này chưa sẵn sàng cho HOLA Maps.', 404);
    res.set('Cache-Control', 'public, max-age=60');
    res.redirect(302, item.url);
  } catch (error) {
    next(error);
  }
});

router.post('/', submissionRateLimiter, upload.array('files'), async (req, res, next) => {
  try {
    const data = submissionSchema.parse(req.body);
    if (!(req.files || []).length && !data.externalLink) {
      throw new AppError('Cần ít nhất một file gốc hoặc link tác phẩm.', 400);
    }

    validateFilesForArtworkType(data.type, req.files || []);

    const created = await createSubmission(data, req.files || []);

    // Important: a newly received submission is NOT sent to HOLA Maps here.
    // HOLA Maps synchronization starts only after Admin approval + publication.
    sendSubmissionReceived({
      to: created.email,
      name: created.display_name || created.name,
      code: created.code,
      title: created.title
    }).catch((error) => console.warn('Submission email skipped/failed:', error.message));

    res.status(201).json({
      id: created.id,
      code: created.code,
      title: created.title,
      status: created.status,
      source: created.submission_source || 'WEB',
      facebookCompletionStatus: created.facebook_completion_status || 'PENDING',
      createdAt: created.created_at,
      holaMapsSyncStatus: 'WAITING_PUBLICATION',
      media: created.media.map((m) => ({
        id: m.id,
        originalName: m.original_name,
        mimeType: m.mime_type,
        size: m.size_bytes,
        sha256: m.sha256,
        provider: m.storage_provider
      }))
    });
  } catch (error) {
    await Promise.all((req.files || []).map((file) => fs.unlink(file.path).catch(() => {})));

    if (error?.name === 'ZodError') {
      return next(new AppError('Thông tin tác phẩm chưa hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

export default router;
