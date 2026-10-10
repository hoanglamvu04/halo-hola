import fs from 'node:fs/promises';
import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { lookupRateLimiter, submissionRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import { submissionSchema, lookupSchema } from '../validators/submission.validators.js';
import { createSubmission, lookupSubmission, getPublicStats, getHaloPublicMediaUrl } from '../services/submission.service.js';
import { queueSubmissionSync } from '../services/holaMaps.service.js';
import { sendSubmissionReceived } from '../services/mail.service.js';
import { verifyToken } from '../utils/jwt.js';
import { pool } from '../database/pool.js';

const router = Router();

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
    const item = await lookupSubmission(code, email);
    if (!item) throw new AppError('Không tìm thấy tác phẩm với mã và email này.', 404);
    res.set('Cache-Control','no-store');
    res.json(item);
  } catch (error) {
    if (error?.name === 'ZodError') {
      return next(new AppError('Mã tác phẩm hoặc email chưa hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

// Stable public HALO media URL. For private R2 originals this endpoint issues a
// fresh, short-lived redirect so Hola Maps never stores a temporary signed URL.
router.get('/media/:mediaId/halo', async (req, res, next) => {
  try {
    const item = await getHaloPublicMediaUrl(req.params.mediaId);
    if (!item?.url) throw new AppError('Ảnh này không sẵn sàng cho HOLA Maps.', 404);
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

    const created = await createSubmission(data, req.files || []);

    // Sync is deliberately fire-and-forget. A Hola Maps outage must never make
    // the HALO HOLA submission fail after its own transaction committed.
    queueSubmissionSync(created.id).catch((error) =>
      console.warn('Hola Maps submission sync enqueue failed:', error.message)
    );

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
      createdAt: created.created_at,
      holaMapsSyncStatus: 'PENDING',
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
