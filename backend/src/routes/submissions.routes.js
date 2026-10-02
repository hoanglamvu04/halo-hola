import { Router } from 'express';
import { upload } from '../middleware/upload.js';
import { submissionRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import { submissionSchema } from '../validators/submission.validators.js';
import { createSubmission } from '../services/submission.service.js';

const router = Router();

router.post('/', submissionRateLimiter, upload.array('files'), async (req, res, next) => {
  try {
    const data = submissionSchema.parse(req.body);
    const created = await createSubmission(data, req.files || []);

    res.status(201).json({
      id: created.id,
      code: created.code,
      status: created.status,
      createdAt: created.created_at,
      media: created.media
    });
  } catch (error) {
    if (error?.name === 'ZodError') {
      return next(new AppError('Thông tin tác phẩm chưa hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

export default router;
