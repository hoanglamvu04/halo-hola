import fs from 'node:fs/promises';
import { Router } from 'express';
import { z } from 'zod';
import { upload } from '../middleware/upload.js';
import { lookupRateLimiter, submissionRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import {
  createFacebookQuickSubmission,
  getSubmissionOperationalState,
  addFilesByIdentity,
  updateFacebookAdmin,
  getSubmissionOperationsOverview,
  listOperationalSubmissions
} from '../services/submissionOperations.service.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

const quickSchema = z.object({
  name: z.string().trim().min(2).max(160),
  displayName: z.string().trim().max(160).optional().or(z.literal('')),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(60),
  title: z.string().trim().min(2).max(280),
  type: z.string().trim().min(1).max(80),
  theme: z.string().trim().min(1).max(180),
  color: z.string().trim().max(120).optional().or(z.literal('')),
  location: z.string().trim().min(2).max(255),
  story: z.string().trim().max(5000).optional().or(z.literal('')),
  rightsConfirmed: z.union([z.boolean(), z.string()]),
  imageConsentConfirmed: z.union([z.boolean(), z.string()]),
  allowMediaUse: z.union([z.boolean(), z.string()]).optional(),
  allowNewsletter: z.union([z.boolean(), z.string()]).optional()
}).superRefine((value, ctx) => {
  const yes = x => x === true || String(x).toLowerCase() === 'true';
  if (!yes(value.rightsConfirmed)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['rightsConfirmed'], message: 'Cần xác nhận quyền tác giả.' });
  if (!yes(value.imageConsentConfirmed)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['imageConsentConfirmed'], message: 'Cần xác nhận quyền hình ảnh phù hợp.' });
});

function parseBool(value, fallback=false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

router.post('/facebook-quick', submissionRateLimiter, async (req,res,next)=>{
  try {
    const parsed=quickSchema.parse(req.body||{});
    const created=await createFacebookQuickSubmission({
      ...parsed,
      imageConsentConfirmed:parseBool(parsed.imageConsentConfirmed,false),
      allowMediaUse:parseBool(parsed.allowMediaUse,true),
      allowNewsletter:parseBool(parsed.allowNewsletter,false)
    });
    res.status(201).json({
      id:created.id,
      code:created.code,
      title:created.title,
      email:created.email,
      phone:created.phone,
      source:created.submission_source,
      facebookCompletionStatus:created.facebook_completion_status,
      status:created.status,
      createdAt:created.created_at
    });
  } catch (error) {
    if (error?.name === 'ZodError') return next(new AppError('Thông tin tạo mã dự thi chưa hợp lệ.',400,error.issues));
    next(error);
  }
});

router.get('/state', lookupRateLimiter, async (req,res,next)=>{
  try {
    const code=String(req.query.code||'').trim();
    const email=String(req.query.email||'').trim();
    if (!code || !email) throw new AppError('Thiếu mã dự thi hoặc email.',400);
    const item=await getSubmissionOperationalState(code,email);
    if (!item) throw new AppError('Không tìm thấy hồ sơ dự thi.',404);
    res.set('Cache-Control','no-store');
    res.json(item);
  } catch (error) { next(error); }
});

router.post('/:code/files', lookupRateLimiter, upload.array('files'), async (req,res,next)=>{
  try {
    const email=String(req.body?.email||'').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Email chưa hợp lệ.',400);
    if (!(req.files||[]).length) throw new AppError('Chưa chọn file để bổ sung.',400);
    const updated=await addFilesByIdentity({code:req.params.code,email,files:req.files||[]});
    if (!updated) throw new AppError('Không tìm thấy hồ sơ để bổ sung file.',404);
    res.json(await getSubmissionOperationalState(req.params.code,email));
  } catch (error) {
    await Promise.all((req.files||[]).map(file=>fs.unlink(file.path).catch(()=>{})));
    next(error);
  }
});

router.get('/admin/overview', authenticateAdmin, async (_req,res,next)=>{
  try { res.json(await getSubmissionOperationsOverview()); }
  catch (error) { next(error); }
});

router.get('/admin/list', authenticateAdmin, async (req,res,next)=>{
  try {
    res.json(await listOperationalSubmissions({
      source:req.query.source,
      issue:req.query.issue,
      q:req.query.q,
      limit:req.query.limit
    }));
  } catch (error) { next(error); }
});

router.patch('/admin/:id/facebook', authenticateAdmin, async (req,res,next)=>{
  try {
    const item=await updateFacebookAdmin({
      id:req.params.id,
      url:req.body?.url,
      verified:req.body?.verified,
      actor:req.user?.email||req.user?.id,
      reactions:req.body?.reactions,
      comments:req.body?.comments,
      shares:req.body?.shares
    });
    if (!item) throw new AppError('Không tìm thấy bài dự thi.',404);
    res.json(item);
  } catch (error) { next(error); }
});

export default router;
