import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { statusSchema, juryNoteSchema } from '../validators/submission.validators.js';
import {
  listSubmissions,
  updateSubmissionStatus,
  updateJuryNote,
  getMediaDownloadUrl
} from '../services/submission.service.js';

const router = Router();
router.use(authenticateAdmin);

router.get('/submissions', async (req, res, next) => {
  try {
    res.json(await listSubmissions({ status: req.query.status, q: req.query.q }));
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

router.patch('/submissions/:id/jury-note', async (req, res, next) => {
  try {
    const { note } = juryNoteSchema.parse(req.body);
    const updated = await updateJuryNote(req.params.id, note);
    if (!updated) throw new AppError('Không tìm thấy tác phẩm.', 404);
    res.json(updated);
  } catch (error) {
    if (error?.name === 'ZodError') {
      return next(new AppError('Ghi chú không hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

router.get('/media/:mediaId/download', async (req, res, next) => {
  try {
    const item = await getMediaDownloadUrl(req.params.mediaId);
    if (!item) throw new AppError('Không tìm thấy file gốc.', 404);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

export default router;
