import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import { submissionUpload } from '../middleware/upload.js';
import { lookupRateLimiter, submissionRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import { submissionSchema, lookupSchema } from '../validators/submission.validators.js';
import { createSubmission, getPublicStats, getHaloPublicMediaUrl } from '../services/submission.service.js';
import { getOptimizedMediaUrl, storeSubmissionMediaVariants } from '../services/mediaVariants.service.js';
import { getSubmissionOperationalState } from '../services/submissionOperations.service.js';
import { confirmFacebookSubmission } from '../services/facebookCompletion.service.js';
import { sendSubmissionReceived } from '../services/mail.service.js';
import { logReceivedNotification } from '../services/submissionNotification.service.js';
import { verifyToken } from '../utils/jwt.js';
import { pool } from '../database/pool.js';
import { env } from '../config/env.js';
import { resolveCommunityAccount } from '../services/communityAccount.service.js';

const router = Router();

const FILE_EXTENSIONS_BY_TYPE = {
  Photo: new Set(['.jpg','.jpeg','.png','.webp','.tif','.tiff','.dng','.cr2','.nef','.arw']),
  Video: new Set(['.mp4','.mov']),
  'Story & Creative': new Set(['.pdf','.doc','.docx','.mp3']),
  'Art & Design': new Set(['.jpg','.jpeg','.png','.webp','.tif','.tiff','.pdf','.dng','.cr2','.nef','.arw'])
};

function uploadedFiles(req){
  if(Array.isArray(req.files))return req.files;
  if(req.files&&typeof req.files==='object')return Object.values(req.files).flat();
  return [];
}

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

// Stable public HALO media URL. Prefer the 1600px derivative for map/feed delivery,
// falling back to the immutable original when the browser could not generate one.
router.get('/media/:mediaId/halo', async (req, res, next) => {
  try {
    const gate=await pool.query(`
      SELECT 1
      FROM submission_media m
      JOIN submissions s ON s.id=m.submission_id
      WHERE m.id=$1
        AND s.status IN ('VALID','SHORTLIST','TOP52','AWARDED')
        AND s.is_demo=FALSE
        AND s.allow_media_use=TRUE
        AND s.rights_confirmed=TRUE
        AND s.image_consent_confirmed=TRUE
        AND (s.is_minor=FALSE OR s.guardian_consent=TRUE)
        AND (
          s.publication_state='PUBLISHED'
          OR (s.publication_state='SCHEDULED' AND s.publish_scheduled_at IS NOT NULL AND s.publish_scheduled_at<=NOW())
        )
      LIMIT 1`,[req.params.mediaId]);
    if(!gate.rowCount) throw new AppError('Ảnh này chưa được công bố cho HOLA Maps.',404);

    const optimized=await getOptimizedMediaUrl(req.params.mediaId,{width:Number(req.query.w)||1600,format:req.query.format||'auto'}).catch(()=>null);
    const item=optimized?.url?optimized:await getHaloPublicMediaUrl(req.params.mediaId);
    if (!item?.url) throw new AppError('Ảnh này chưa sẵn sàng cho HOLA Maps.', 404);
    res.set('Cache-Control', 'public, max-age=300');
    res.redirect(302, item.url);
  } catch (error) {
    next(error);
  }
});

router.post('/', submissionRateLimiter, submissionUpload.fields([
  {name:'files',maxCount:env.maxUploadFileCount},
  {name:'previews',maxCount:env.maxUploadFileCount*6}
]), async (req, res, next) => {
  const originals=req.files?.files||[];
  const previews=req.files?.previews||[];
  try {
    const data = submissionSchema.parse(req.body);
    const communityAccount = await resolveCommunityAccount(req);
    if (communityAccount) data.email = communityAccount.email;
    if (!originals.length && !data.externalLink) {
      throw new AppError('Cần ít nhất một file gốc hoặc link tác phẩm.', 400);
    }

    validateFilesForArtworkType(data.type, originals);

    const created = await createSubmission(data, originals, { contributorId: communityAccount?.id || null });
    let optimizedMedia={stored:0,skipped:previews.length};
    if(previews.length){
      optimizedMedia=await storeSubmissionMediaVariants(created,previews).catch(async(error)=>{
        console.warn('Submission optimized media skipped:',error.message);
        await Promise.all(previews.map(file=>fs.unlink(file.path).catch(()=>{})));
        return {stored:0,skipped:previews.length};
      });
    }

    // Important: a newly received submission is NOT sent to HOLA Maps here.
    // HOLA Maps synchronization starts only after Admin approval + publication.
    sendSubmissionReceived({
      to: created.email,
      name: created.display_name || created.name,
      code: created.code,
      title: created.title
    }).then((delivery)=>logReceivedNotification({
      submissionId:created.id,
      email:created.email,
      delivery
    })).catch((error)=>{
      logReceivedNotification({submissionId:created.id,email:created.email,error}).catch(()=>{});
      console.warn('Submission email skipped/failed:', error.message);
    });

    res.status(201).json({
      id: created.id,
      code: created.code,
      title: created.title,
      status: created.status,
      source: created.submission_source || 'WEB',
      facebookCompletionStatus: created.facebook_completion_status || 'PENDING',
      createdAt: created.created_at,
      holaMapsSyncStatus: 'WAITING_PUBLICATION',
      optimizedMedia,
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
    await Promise.all(uploadedFiles(req).map((file) => fs.unlink(file.path).catch(() => {})));

    if (error?.name === 'ZodError') {
      return next(new AppError('Thông tin tác phẩm chưa hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

export default router;