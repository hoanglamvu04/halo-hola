import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { statusSchema, juryNoteSchema } from '../validators/submission.validators.js';
import { listTourRegistrations } from '../services/tourRegistration.service.js';
import { upload } from '../middleware/upload.js';
import { getHomepageSections, updateHomepageSection, listSiteAssets, saveSiteAsset } from '../services/siteContent.service.js';
import {
  listAdminStories, createAdminStory, updateAdminStory, deleteAdminStory,
  listAdminTours, createAdminTour, updateAdminTour, deleteAdminTour,
  listAdminPlaces, createAdminPlace, updateAdminPlace, deleteAdminPlace,
  listAdminPartners, createAdminPartner, updateAdminPartner, deleteAdminPartner,
  getSiteSettings, updateSiteSetting,
  listMediaLibrary, updateMediaAsset, deleteMediaAsset
} from '../services/cms.service.js';
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

router.get('/cms/stories', async (_req,res,next)=>{
  try{res.json(await listAdminStories());}catch(error){next(error);}
});
router.post('/cms/stories', async (req,res,next)=>{
  try{res.status(201).json(await createAdminStory(req.body||{}));}catch(error){next(error);}
});
router.put('/cms/stories/:id', async (req,res,next)=>{
  try{
    const item=await updateAdminStory(req.params.id,req.body||{});
    if(!item) throw new AppError('Không tìm thấy Story.',404);
    res.json(item);
  }catch(error){next(error);}
});
router.delete('/cms/stories/:id', async (req,res,next)=>{
  try{
    const item=await deleteAdminStory(req.params.id);
    if(!item) throw new AppError('Không tìm thấy Story.',404);
    res.json(item);
  }catch(error){next(error);}
});

router.get('/cms/tours', async (_req,res,next)=>{
  try{res.json(await listAdminTours());}catch(error){next(error);}
});
router.post('/cms/tours', async (req,res,next)=>{
  try{res.status(201).json(await createAdminTour(req.body||{}));}catch(error){next(error);}
});
router.put('/cms/tours/:id', async (req,res,next)=>{
  try{
    const item=await updateAdminTour(req.params.id,req.body||{});
    if(!item) throw new AppError('Không tìm thấy Tour.',404);
    res.json(item);
  }catch(error){next(error);}
});
router.delete('/cms/tours/:id', async (req,res,next)=>{
  try{
    const item=await deleteAdminTour(req.params.id);
    if(!item) throw new AppError('Không tìm thấy Tour.',404);
    res.json(item);
  }catch(error){next(error);}
});

router.get('/cms/places', async (_req,res,next)=>{
  try{res.json(await listAdminPlaces());}catch(error){next(error);}
});
router.post('/cms/places', async (req,res,next)=>{
  try{res.status(201).json(await createAdminPlace(req.body||{}));}catch(error){next(error);}
});
router.put('/cms/places/:id', async (req,res,next)=>{
  try{
    const item=await updateAdminPlace(req.params.id,req.body||{});
    if(!item) throw new AppError('Không tìm thấy địa điểm.',404);
    res.json(item);
  }catch(error){next(error);}
});
router.delete('/cms/places/:id', async (req,res,next)=>{
  try{
    const item=await deleteAdminPlace(req.params.id);
    if(!item) throw new AppError('Không tìm thấy địa điểm.',404);
    res.json(item);
  }catch(error){next(error);}
});

router.get('/cms/partners', async (_req,res,next)=>{
  try{res.json(await listAdminPartners());}catch(error){next(error);}
});
router.post('/cms/partners', async (req,res,next)=>{
  try{res.status(201).json(await createAdminPartner(req.body||{}));}catch(error){next(error);}
});
router.put('/cms/partners/:id', async (req,res,next)=>{
  try{
    const item=await updateAdminPartner(req.params.id,req.body||{});
    if(!item) throw new AppError('Không tìm thấy đối tác.',404);
    res.json(item);
  }catch(error){next(error);}
});
router.delete('/cms/partners/:id', async (req,res,next)=>{
  try{
    const item=await deleteAdminPartner(req.params.id);
    if(!item) throw new AppError('Không tìm thấy đối tác.',404);
    res.json(item);
  }catch(error){next(error);}
});

router.get('/cms/settings', async (_req,res,next)=>{
  try{res.json(await getSiteSettings());}catch(error){next(error);}
});
router.put('/cms/settings/:key', async (req,res,next)=>{
  try{res.json(await updateSiteSetting(req.params.key,req.body||{}));}catch(error){next(error);}
});

router.get('/media-library', async (req,res,next)=>{
  try{
    res.json(await listMediaLibrary({
      q:req.query.q,
      folder:req.query.folder,
      sectionKey:req.query.sectionKey,
      archived:req.query.archived==='true'
    }));
  }catch(error){next(error);}
});
router.patch('/media-library/:id', async (req,res,next)=>{
  try{
    const item=await updateMediaAsset(req.params.id,req.body||{});
    if(!item) throw new AppError('Không tìm thấy media.',404);
    res.json(item);
  }catch(error){next(error);}
});
router.delete('/media-library/:id', async (req,res,next)=>{
  try{
    const item=await deleteMediaAsset(req.params.id);
    if(!item) throw new AppError('Không tìm thấy media.',404);
    res.json(item);
  }catch(error){next(error);}
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
