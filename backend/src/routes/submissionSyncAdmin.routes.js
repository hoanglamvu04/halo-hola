import fs from 'node:fs/promises';
import { Router } from 'express';
import { authenticateAdmin, requireRoles } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { AppError } from '../utils/AppError.js';
import {
  deleteSubmission,
  listSubmissions,
  replaceSubmissionFiles,
  updateSubmissionContent
} from '../services/submission.service.js';
import { reconcileSubmissionHolaMaps } from '../services/holaMaps.service.js';

const router = Router();
router.use(authenticateAdmin);

async function reconcile(id) {
  try{return await reconcileSubmissionHolaMaps(id);}
  catch(error){
    console.warn(`Hola Maps re-sync failed for submission ${id}:`, error.message);
    return {action:'ERROR',error:error.message};
  }
}

router.post('/reset-all', requireRoles('ADMIN'), async (req, res, next) => {
  try {
    const confirmation = String(req.body?.confirm || '').trim();
    if (confirmation !== 'RESET_ALL_SUBMISSIONS') {
      throw new AppError('Cần xác nhận thao tác làm trống danh sách tác phẩm.', 400);
    }

    const items = await listSubmissions();
    let removed = 0;
    for (const item of items) {
      const result = await deleteSubmission(item.id);
      if (result) removed += 1;
    }

    res.json({ ok: true, removed });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/content', async (req, res, next) => {
  try {
    const updated = await updateSubmissionContent(req.params.id, req.body || {});
    if (!updated) throw new AppError('Không tìm thấy tác phẩm.', 404);
    const holaMaps=await reconcile(updated.id);
    res.json({ ...updated, holaMaps });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/media', upload.array('files'), async (req, res, next) => {
  try {
    if (!(req.files || []).length) throw new AppError('Cần ít nhất một file thay thế.', 400);
    const updated = await replaceSubmissionFiles(req.params.id, req.files || []);
    if (!updated) throw new AppError('Không tìm thấy tác phẩm.', 404);
    const holaMaps=await reconcile(req.params.id);
    res.json({
      id: req.params.id,
      holaMaps,
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
    const holaMaps = await reconcileSubmissionHolaMaps(req.params.id);
    if (holaMaps.action === 'NONE') {
      throw new AppError(
        holaMaps.reason === 'MISSING_IMAGE_OR_LOCATION'
          ? 'Tác phẩm đã công bố nhưng chưa có ảnh hoặc vị trí có cấu trúc để đồng bộ HOLA Maps.'
          : 'Tác phẩm chưa được duyệt và công bố nên chưa thể đồng bộ HOLA Maps.',
        400
      );
    }
    if (holaMaps.action === 'ERROR') throw new AppError(holaMaps.error || 'Không thể đồng bộ HOLA Maps.',502);
    res.status(202).json({ ok: true, holaMaps });
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
