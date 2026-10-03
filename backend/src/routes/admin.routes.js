import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { statusSchema, juryNoteSchema } from '../validators/submission.validators.js';
import { listTourRegistrations } from '../services/tourRegistration.service.js';
import { upload } from '../middleware/upload.js';
import { getHomepageSections, updateHomepageSection, listSiteAssets, saveSiteAsset } from '../services/siteContent.service.js';
import {
  listSubmissions,
  updateSubmissionStatus,
  updateJuryNote,
  getMediaDownloadUrl
} from '../services/submission.service.js';

const router = Router();
router.use(authenticateAdmin);

router.get('/site/homepage', async (_req, res, next) => {
  try {
    res.json(await getHomepageSections());
  } catch (error) {
    next(error);
  }
});

router.put('/site/homepage/:sectionKey', async (req, res, next) => {
  try {
    const updated = await updateHomepageSection(req.params.sectionKey, {
      enabled: req.body.enabled,
      content: req.body.content
    });
    if (!updated) throw new AppError('Không tìm thấy section trang chủ.', 404);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.get('/site-assets', async (req, res, next) => {
  try {
    res.json(await listSiteAssets(req.query.sectionKey));
  } catch (error) {
    next(error);
  }
});

router.post('/site-assets', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Chưa chọn ảnh.', 400);
    if (!req.file.mimetype?.startsWith('image/')) {
      throw new AppError('Media Library hiện chỉ nhận file ảnh.', 400);
    }
    const asset = await saveSiteAsset({
      sectionKey: req.body.sectionKey || 'general',
      file: req.file
    });
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
});

router.get('/tour-registrations', async (req, res, next) => {
  try {
    res.json(await listTourRegistrations(req.query.tourNumber));
  } catch (error) {
    next(error);
  }
});

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
