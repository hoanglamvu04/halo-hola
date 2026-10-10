import fs from 'node:fs/promises';
import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { AppError } from '../utils/AppError.js';
import {
  deleteSubmission,
  replaceSubmissionFiles,
  updateSubmissionContent
} from '../services/submission.service.js';
import { queueSubmissionSync } from '../services/holaMaps.service.js';

const router = Router();
router.use(authenticateAdmin);

function enqueueResync(id) {
  queueSubmissionSync(id).catch((error) =>
    console.warn(`Hola Maps re-sync enqueue failed for submission ${id}:`, error.message)
  );
}

router.patch('/:id/content', async (req, res, next) => {
  try {
    const updated = await updateSubmissionContent(req.params.id, req.body || {});
    if (!updated) throw new AppError('Không tìm thấy tác phẩm.', 404);
    enqueueResync(updated.id);
    res.json({ ...updated, holaMapsSyncStatus: 'PENDING' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/media', upload.array('files'), async (req, res, next) => {
  try {
    if (!(req.files || []).length) throw new AppError('Cần ít nhất một file thay thế.', 400);
    const updated = await replaceSubmissionFiles(req.params.id, req.files || []);
    if (!updated) throw new AppError('Không tìm thấy tác phẩm.', 404);
    enqueueResync(req.params.id);
    res.json({
      id: req.params.id,
      holaMapsSyncStatus: 'PENDING',
      media: updated.media.map((item) => ({
        id: item.id,
        originalName: item.original_name,
        mimeType: item.mime_type,
        size: item.size_bytes,
        provider: item.storage_provider
      }))
    });
  } catch (error) {
    await Promise.all((req.files || []).map((file) => fs.unlink(file.path).catch(() => {})));
    next(error);
  }
});

router.post('/:id/hola-maps-sync', async (req, res, next) => {
  try {
    const jobId = await queueSubmissionSync(req.params.id);
    if (!jobId) throw new AppError('Tác phẩm chưa có ảnh hoặc chưa có vị trí để đồng bộ HOLA Maps.', 400);
    res.status(202).json({ ok: true, jobId, holaMapsSyncStatus: 'PENDING' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await deleteSubmission(req.params.id);
    if (!deleted) throw new AppError('Không tìm thấy tác phẩm.', 404);
    res.json({
      ok: true,
      id: deleted.id,
      code: deleted.code,
      holaMapsDeleteQueued: true,
      holaMapsJobId: deleted.holaMapsJobId
    });
  } catch (error) {
    next(error);
  }
});

export default router;
