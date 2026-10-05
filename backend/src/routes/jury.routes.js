import { Router } from 'express';
import { authenticateJury } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { getMediaDownloadUrl } from '../services/submission.service.js';
import {
  listJurySubmissions,
  getJuryScorecard,
  saveJuryScore,
  getJuryStats
} from '../services/jury.service.js';

const router = Router();
router.use(authenticateJury);

router.get('/stats', async (req,res,next)=>{
  try { res.json(await getJuryStats(req.user?.id)); }
  catch (error) { next(error); }
});

router.get('/submissions', async (req,res,next)=>{
  try {
    res.json(await listJurySubmissions({
      jurorId:req.user?.id,
      filters:{
        q:req.query.q,
        status:req.query.status,
        type:req.query.type,
        theme:req.query.theme,
        color:req.query.color,
        location:req.query.location,
        review:req.query.review,
        recommendation:req.query.recommendation,
        rights:req.query.rights,
        hasMedia:req.query.hasMedia,
        minScore:req.query.minScore,
        maxScore:req.query.maxScore,
        sort:req.query.sort
      }
    }));
  } catch (error) { next(error); }
});

router.get('/submissions/:id/score', async (req,res,next)=>{
  try { res.json(await getJuryScorecard(req.params.id,req.user?.id)); }
  catch (error) { next(error); }
});

router.put('/submissions/:id/score', async (req,res,next)=>{
  try {
    const fields=['quality','representation','story','creativity'];
    for (const field of fields) {
      const value=Number(req.body?.[field]);
      if (!Number.isFinite(value)||value<0||value>10) {
        throw new AppError(`${field} phải nằm trong khoảng 0–10.`,400);
      }
    }
    res.json(await saveJuryScore({submissionId:req.params.id,jurorId:req.user?.id,input:req.body||{}}));
  } catch (error) {
    if (error?.message==='JUROR_ACCOUNT_REQUIRED') return next(new AppError('Jury Mode cần đăng nhập bằng tài khoản cá nhân.',400));
    next(error);
  }
});

router.get('/media/:mediaId/download', async (req,res,next)=>{
  try {
    const item=await getMediaDownloadUrl(req.params.mediaId);
    if (!item) throw new AppError('Không tìm thấy file gốc.',404);
    res.json(item);
  } catch (error) { next(error); }
});

export default router;
