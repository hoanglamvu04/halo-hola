import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { statusSchema } from '../validators/submission.validators.js';
import { listSubmissions, updateSubmissionStatus } from '../services/submission.service.js';

const router = Router();
router.use(authenticateAdmin);

router.get('/submissions', async (req, res, next) => {
  try {
    res.json(await listSubmissions(req.query.status));
  } catch (error) {
    next(error);
  }
});

router.patch('/submissions/:id/status', async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const updated = await updateSubmissionStatus(req.params.id, status);
    if (!updated) throw new AppError('Không tìm thấy tác phẩm.', 404);
    res.json(updated);
  } catch (error) {
    if (error?.name === 'ZodError') {
      return next(new AppError('Trạng thái không hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

export default router;
