import { Router } from 'express';
import { z } from 'zod';
import { communityAuthRateLimiter } from '../middleware/rateLimit.js';
import { AppError } from '../utils/AppError.js';
import {
  clearCommunitySessionCookie,
  listCommunitySubmissions,
  logoutCommunitySession,
  requestCommunityLoginCode,
  requireCommunityAccount,
  resolveCommunityAccount,
  setCommunitySessionCookie,
  updateCommunityProfile,
  verifyCommunityLoginCode
} from '../services/communityAccount.service.js';

const router=Router();
router.use((_req,res,next)=>{res.set('Cache-Control','no-store');next();});

const emailSchema=z.object({email:z.string().trim().email().max(255)});
const verifySchema=emailSchema.extend({code:z.string().trim().regex(/^\d{6}$/)});
const profileSchema=z.object({
  name:z.string().trim().min(2).max(160),
  displayName:z.string().trim().max(160).optional().default(''),
  phone:z.string().trim().min(6).max(60),
  bio:z.string().trim().max(1000).optional().default('')
});

router.post('/request-code',communityAuthRateLimiter,async(req,res,next)=>{
  try{
    const {email}=emailSchema.parse(req.body);
    res.json(await requestCommunityLoginCode({email,ip:req.ip}));
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Email chưa hợp lệ.',400,error.issues));
    return next(error);
  }
});

router.post('/verify-code',communityAuthRateLimiter,async(req,res,next)=>{
  try{
    const input=verifySchema.parse(req.body);
    const result=await verifyCommunityLoginCode({
      ...input,
      userAgent:req.headers['user-agent']
    });
    setCommunitySessionCookie(res,result.token);
    res.json({account:result.account});
  }catch(error){
    if(error?.name==='ZodError')return next(new AppError('Mã đăng nhập chưa hợp lệ.',400,error.issues));
    return next(error);
  }
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
