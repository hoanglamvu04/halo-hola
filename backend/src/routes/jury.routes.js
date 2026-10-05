import { Router } from 'express';
import { authenticateJury } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import { pool } from '../database/pool.js';
import { getMediaDownloadUrl } from '../services/submission.service.js';
import {
  listJurySubmissions,
  getJuryScorecard,
  saveJuryScore,
  getJuryStats
} from '../services/jury.service.js';

const router = Router();
router.use(authenticateJury);

async function juryScope(user){
  if(user?.role!=='JUROR') return {themes:[],types:[]};
  const {rows}=await pool.query('SELECT allowed_themes,allowed_types FROM jury_profiles WHERE juror_id=$1',[user.id]);
  return {themes:rows[0]?.allowed_themes||[],types:rows[0]?.allowed_types||[]};
}
function inScope(item,scope){
  const themeOk=!scope.themes.length||scope.themes.includes(item.theme);
  const typeOk=!scope.types.length||scope.types.includes(item.type);
  return themeOk&&typeOk;
}

router.get('/stats', async (req,res,next)=>{
  try {
    const stats=await getJuryStats(req.user?.id);
    if(req.user?.role==='JUROR'){
      const scope=await juryScope(req.user);
      const scoped=(await listJurySubmissions({jurorId:req.user.id,filters:{}})).filter(item=>inScope(item,scope));
      stats.total=scoped.length;
      stats.my_scored=scoped.filter(x=>x.my_score?.submitted&&!x.my_score?.conflictOfInterest).length;
      stats.my_conflicts=scoped.filter(x=>x.my_score?.conflictOfInterest).length;
      stats.my_unscored=scoped.filter(x=>!x.my_score).length;
      stats.scope={themes:scope.themes,types:scope.types};
    }
    res.json(stats);
  } catch (error) { next(error); }
});

router.get('/submissions', async (req,res,next)=>{
  try {
    let items=await listJurySubmissions({
      jurorId:req.user?.id,
      filters:{
        q:req.query.q,status:req.query.status,type:req.query.type,theme:req.query.theme,color:req.query.color,
        location:req.query.location,review:req.query.review,recommendation:req.query.recommendation,
        rights:req.query.rights,hasMedia:req.query.hasMedia,minScore:req.query.minScore,maxScore:req.query.maxScore,sort:req.query.sort
      }
    });
    if(req.user?.role==='JUROR'){
      const scope=await juryScope(req.user);
      items=items.filter(item=>inScope(item,scope));
    }
    res.json(items);
  } catch (error) { next(error); }
});

router.get('/submissions/:id/score', async (req,res,next)=>{
  try { res.json(await getJuryScorecard(req.params.id,req.user?.id)); }
  catch (error) { next(error); }
});

router.put('/submissions/:id/score', async (req,res,next)=>{
  try {
    if(req.user?.role==='JUROR'){
      const scope=await juryScope(req.user);
      const {rows}=await pool.query('SELECT theme,type FROM submissions WHERE id=$1',[req.params.id]);
      if(!rows[0]) throw new AppError('Không tìm thấy tác phẩm.',404);
      if(!inScope(rows[0],scope)) throw new AppError('Tác phẩm này không thuộc phạm vi chấm được phân công.',403);
    }
    const fields=['quality','representation','story','creativity'];
    for (const field of fields) {
      const value=Number(req.body?.[field]);
      if (!Number.isFinite(value)||value<0||value>10) throw new AppError(`${field} phải nằm trong khoảng 0–10.`,400);
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
