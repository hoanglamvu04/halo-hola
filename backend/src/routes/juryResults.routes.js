import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { AppError } from '../utils/AppError.js';
import {
  getJuryResultsOverview,
  listJuryResultsRanking,
  buildJurySelections,
  setJurySelection,
  setJuryRoundStatus,
  publishTop52Selection,
  listJuryAudit
} from '../services/juryResults.service.js';

const router=Router();
router.use(authenticateAdmin);

router.get('/overview',async (_req,res,next)=>{
  try{res.json(await getJuryResultsOverview());}catch(error){next(error);}
});

router.get('/ranking',async (req,res,next)=>{
  try{res.json(await listJuryResultsRanking(req.query||{}));}catch(error){next(error);}
});

router.post('/selections/auto',async (req,res,next)=>{
  try{
    res.json(await buildJurySelections({
      actorId:req.user?.id,
      includeDemo:Boolean(req.body?.includeDemo),
      top52Limit:req.body?.top52Limit,
      reserveLimit:req.body?.reserveLimit,
      reason:req.body?.reason||''
    }));
  }catch(error){next(error);}
});

router.put('/selections/:submissionId',async (req,res,next)=>{
  try{
    res.json(await setJurySelection({
      actorId:req.user?.id,
      submissionId:req.params.submissionId,
      selectionType:req.body?.selectionType,
      selected:req.body?.selected!==false,
      note:req.body?.note||''
    }));
  }catch(error){
    if(error?.message==='INVALID_SELECTION_TYPE') return next(new AppError('Loại lựa chọn không hợp lệ.',400));
    next(error);
  }
});

router.post('/round/lock',async (req,res,next)=>{
  try{res.json(await setJuryRoundStatus({actorId:req.user?.id,status:'LOCKED',reason:req.body?.reason||''}));}catch(error){next(error);}
});

router.post('/round/reopen',async (req,res,next)=>{
  try{res.json(await setJuryRoundStatus({actorId:req.user?.id,status:'OPEN',reason:req.body?.reason||''}));}catch(error){next(error);}
});

router.post('/publish-top52',async (req,res,next)=>{
  try{res.json(await publishTop52Selection({actorId:req.user?.id,reason:req.body?.reason||''}));}
  catch(error){
    if(error?.message==='NO_TOP52_SELECTION') return next(new AppError('Chưa có danh sách TOP52 để đồng bộ.',400));
    next(error);
  }
});

router.get('/audit',async (req,res,next)=>{
  try{res.json(await listJuryAudit(req.query?.limit));}catch(error){next(error);}
});

export default router;
