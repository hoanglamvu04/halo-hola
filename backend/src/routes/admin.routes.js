import { Router } from 'express';
import { z } from 'zod';
import { authenticateAdmin, requireRoles } from '../middleware/auth.js';
import { listConnectionStatuses, saveConnectionSettings, resetConnectionSettings } from '../services/connectionSettings.service.js';
import { verifySmtpConnection } from '../services/mail.service.js';
import { AppError } from '../utils/AppError.js';
import { statusSchema } from '../validators/submission.validators.js';
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
  getMediaDownloadUrl
} from '../services/submission.service.js';
import {
  getSubmissionNotificationTargetById,
  sendStatusNotificationForSubmission,
  sendStatusNotificationByCode
} from '../services/submissionNotification.service.js';
import {
  issueAdminCommunityLoginCode,
  listAdminCommunityLoginCodes,
  revokeAdminCommunityLoginCode
} from '../services/communityAccount.service.js';
const router = Router();
// Authenticate every admin route before checking granular ADMIN permissions.
router.use(authenticateAdmin);
const smtpSchema=z.object({
  enabled:z.boolean(), host:z.string().trim().max(255),
  port:z.coerce.number().int().min(1).max(65535),
  secure:z.boolean(), user:z.string().trim().max(255),
  password:z.string().max(1024), fromName:z.string().trim().max(160),
  fromAddress:z.union([z.literal(''),z.string().trim().email().max(255)])
});
const mapsSchema=z.object({
  enabled:z.boolean(),baseUrl:z.string().trim().max(512),
  secret:z.string().max(1024),timeoutMs:z.coerce.number().int().min(1000).max(30000)
});
const r2Schema=z.object({
  enabled:z.boolean(),endpoint:z.string().trim().max(512),
  accessKeyId:z.string().max(512),secretAccessKey:z.string().max(1024),
  bucketOriginals:z.string().trim().max(255),bucketPublic:z.string().trim().max(255)
});
const connectionSchemas={smtp:smtpSchema,hola_maps:mapsSchema,r2:r2Schema};
router.get('/connections',requireRoles('ADMIN'),(_req,res)=>{
  res.set('Cache-Control','no-store');
  res.json({items:listConnectionStatuses()});
});
router.put('/connections/:key',requireRoles('ADMIN'),async(req,res,next)=>{
  try{
    const schema=connectionSchemas[req.params.key];
    if(!schema)throw new AppError('Kết nối không được hỗ trợ.',404);
    res.set('Cache-Control','no-store');
    res.json(await saveConnectionSettings(req.params.key,schema.parse(req.body),req.user.id));
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Cấu hình không hợp lệ.',400,error.issues));
    next(error);
  }
});
router.delete('/connections/:key',requireRoles('ADMIN'),async(req,res,next)=>{
  try{
    res.set('Cache-Control','no-store');
    res.json(await resetConnectionSettings(req.params.key));
  }catch(error){next(error);}
});
router.post('/connections/smtp/test',requireRoles('ADMIN'),async(_req,res,next)=>{
  try{
    res.set('Cache-Control','no-store');
    res.json(await verifySmtpConnection());
  }catch(error){
    console.warn('SMTP verification failed:',error?.code||error?.name||'ERROR');
    res.json({ok:false,message:'Không xác minh được SMTP. Kiểm tra host, cổng, TLS và tài khoản.'});
  }
});
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

const adminCommunityCodeSchema=z.object({
  email:z.string().trim().email().max(255),
  expiresInMinutes:z.coerce.number().int().min(5).max(60).optional().default(10),
  purpose:z.enum(['VERIFY_EMAIL','RESET_PASSWORD']).optional().default('VERIFY_EMAIL')
});

router.get('/community-login-codes', requireRoles('ADMIN'), async (req,res,next)=>{
  try{
    res.json({
      items:await listAdminCommunityLoginCodes({
        q:req.query.q,
        limit:req.query.limit
      })
    });
  }catch(error){next(error);}
});

router.post('/community-login-codes', requireRoles('ADMIN'), async (req,res,next)=>{
  try{
    const input=adminCommunityCodeSchema.parse(req.body||{});
    res.status(201).json(await issueAdminCommunityLoginCode(input));
  }catch(error){
    if(error?.name==='ZodError'){
      return next(new AppError('Thông tin tạo mã chưa hợp lệ.',400,error.issues));
    }
    return next(error);
  }
});

router.delete('/community-login-codes/:id', requireRoles('ADMIN'), async (req,res,next)=>{
  try{
    const item=await revokeAdminCommunityLoginCode(req.params.id);
    if(!item)throw new AppError('Không tìm thấy mã đăng nhập.',404);
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
    const before = await getSubmissionNotificationTargetById(req.params.id);
    const updated = await updateSubmissionStatus(req.params.id, status);
    if (!updated) throw new AppError('Không tìm thấy tác phẩm.', 404);

    if (before && before.status !== status) {
      sendStatusNotificationForSubmission(updated).catch((error) =>
        console.warn('Status email skipped/failed:', error.message)
      );
    }

    res.json(updated);
  } catch (error) {
    if (error?.name === 'ZodError') {
      return next(new AppError('Trạng thái không hợp lệ.', 400, error.issues));
    }
    return next(error);
  }
});

router.post('/submissions/notify', async (req, res, next) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase();
    if (!/^HH26-[A-Z0-9-]{3,}$/i.test(code)) {
      throw new AppError('Mã dự thi chưa hợp lệ.', 400);
    }
    const result = await sendStatusNotificationByCode(code);
    if (!result) throw new AppError('Không tìm thấy tác phẩm.', 404);
    res.json({
      ok: true,
      code: result.submission.code,
      status: result.submission.status,
      delivery: result.delivery
    });
  } catch (error) {
    next(error);
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
