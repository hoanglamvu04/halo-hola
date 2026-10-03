import fs from 'node:fs/promises';
import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { submissionRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import { submissionSchema, lookupSchema } from '../validators/submission.validators.js';
import { createSubmission, lookupSubmission, getPublicStats } from '../services/submission.service.js';

const router = Router();

router.get('/stats', async (_req, res, next) => {
  try {
    res.json(await getPublicStats());
  } catch (error) {
    next(error);
  }
});

router.get('/lookup', async (req, res, next) => {
  try {
    const { code, email } = lookupSchema.parse(req.query);
    const item = await lookupSubmission(code, email);
    if (!item) throw new AppError('Không tìm thấy tác phẩm với mã và email này.', 404);
    res.json(item);
  } catch (error) {
    await Promise.all((req.files || []).map((file) => fs.unlink(file.path).catch(() => {})));
    if (error?.name === 'ZodError') {
      return next(new AppError('Mã tác phẩm hoặc email chưa hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

router.post('/', submissionRateLimiter, upload.array('files'), async (req, res, next) => {
  try {
    const data = submissionSchema.parse(req.body);
    if (!(req.files || []).length && !data.externalLink) {
      throw new AppError('Cần ít nhất một file gốc hoặc link tác phẩm.', 400);
    }
    const created = await createSubmission(data, req.files || []);

    res.status(201).json({
      id: created.id,
      code: created.code,
      title: created.title,
      status: created.status,
      createdAt: created.created_at,
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
    if (error?.name === 'ZodError') {
      return next(new AppError('Thông tin tác phẩm chưa hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

export default router;
