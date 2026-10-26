import { Router } from 'express';
import { z } from 'zod';
import { communityAuthRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import {
  clearCommunitySessionCookie,
  listCommunitySubmissions,
  logoutCommunitySession,
  requireCommunityAccount,
  resolveCommunityAccount,
  setCommunitySessionCookie,
  updateCommunityProfile
} from '../services/communityAccount.service.js';
import {
  passwordIsValid,
  registerCommunityWithPassword,
  resendCommunityVerification,
  verifyCommunityEmail,
  loginCommunityWithPassword,
  requestCommunityPasswordReset,
  resetCommunityPassword
} from '../services/communityPasswordAuth.service.js';

const router=Router();
router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next();});

const emailSchema=z.object({email:z.string().trim().email().max(255)});
const verifySchema=emailSchema.extend({code:z.string().trim().regex(/^\d{6}$/)});
const passwordSchema=z.string().refine(passwordIsValid,{
  message:'Mật khẩu phải có ít nhất 8 ký tự, tối đa 72 byte.'
});
const registerSchema=emailSchema.extend({
  name:z.string().trim().min(2).max(160),
  password:passwordSchema
});
const loginSchema=emailSchema.extend({password:z.string().min(1).max(256)});
const resetSchema=verifySchema.extend({password:passwordSchema});
const profileSchema=z.object({
  name:z.string().trim().min(2).max(160),
  displayName:z.string().trim().max(160).optional().default(''),
  phone:z.string().trim().min(6).max(60),
  bio:z.string().trim().max(1000).optional().default('')
});

// An email code is now used only for registration verification or password recovery.
router.post('/register',communityAuthRateLimiter,async(req,res,next)=>{
  try{
    const input=registerSchema.parse(req.body);
    res.status(202).json(await registerCommunityWithPassword({...input,ip:req.ip}));
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Thông tin đăng ký chưa hợp lệ.',400,error.issues));
    next(error);
  }
});

router.post('/resend-verification',communityAuthRateLimiter,async(req,res,next)=>{
  try{
    const input=emailSchema.parse(req.body);
    res.json(await resendCommunityVerification({...input,ip:req.ip}));
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Email chưa hợp lệ.',400,error.issues));
    next(error);
  }
});

router.post('/verify-email',communityAuthRateLimiter,async(req,res,next)=>{
  try{
    const input=verifySchema.parse(req.body);
    const result=await verifyCommunityEmail({...input,userAgent:req.headers['user-agent']});
    setCommunitySessionCookie(res,result.token);
    res.json({account:result.account});
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Mã xác minh chưa hợp lệ.',400,error.issues));
    next(error);
  }
});

router.post('/login',communityAuthRateLimiter,async(req,res,next)=>{
  try{
    const input=loginSchema.parse(req.body);
    const result=await loginCommunityWithPassword({...input,userAgent:req.headers['user-agent']});
    setCommunitySessionCookie(res,result.token);
    res.json({account:result.account});
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Vui lòng nhập email và mật khẩu.',400,error.issues));
    next(error);
  }
});

router.post('/request-password-reset',communityAuthRateLimiter,async(req,res,next)=>{
  try{
    const input=emailSchema.parse(req.body);
    res.json(await requestCommunityPasswordReset({...input,ip:req.ip}));
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Email chưa hợp lệ.',400,error.issues));
    next(error);
  }
});

router.post('/reset-password',communityAuthRateLimiter,async(req,res,next)=>{
  try{
    const input=resetSchema.parse(req.body);
    const result=await resetCommunityPassword({...input,userAgent:req.headers['user-agent']});
    setCommunitySessionCookie(res,result.token);
    res.json({account:result.account});
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Mã hoặc mật khẩu mới chưa hợp lệ.',400,error.issues));
    next(error);
  }
});

// Do not leave passwordless OTP login endpoints active after migration.
router.post(['/request-code','/verify-code'],(_req,res)=>{
  res.status(410).json({error:'Đăng nhập bằng mã OTP đã được thay bằng email và mật khẩu.'});
});

router.get('/me',async(req,res,next)=>{
  try{
    res.json({account:await resolveCommunityAccount(req)});
  }catch(error){next(error);}
});

router.patch('/profile',async(req,res,next)=>{
  try{
    const account=await requireCommunityAccount(req);
    const input=profileSchema.parse(req.body);
    res.json({account:await updateCommunityProfile(account.id,input)});
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Thông tin hồ sơ chưa hợp lệ.',400,error.issues));
    return next(error);
  }
});

router.get('/submissions',async(req,res,next)=>{
  try{
    const account=await requireCommunityAccount(req);
    res.json({items:await listCommunitySubmissions(account.id)});
  }catch(error){next(error);}
});

router.post('/logout',async(req,res,next)=>{
  try{
    await logoutCommunitySession(req);
    clearCommunitySessionCookie(res);
    res.json({ok:true});
  }catch(error){next(error);}
});

export default router;
