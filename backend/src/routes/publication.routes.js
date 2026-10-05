import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import {
  getPublicationOverview,
  listPublicationItems,
  setPublicationState,
  bulkSetPublicationState,
  listPublicationAudit
} from '../services/publication.service.js';

const router=Router();
router.use(authenticateAdmin);

router.get('/overview',async(_req,res,next)=>{
  try{res.json(await getPublicationOverview());}catch(error){next(error);}
});

router.get('/items',async(req,res,next)=>{
  try{
    res.json(await listPublicationItems({
      q:req.query.q,
      status:req.query.status,
      publicationState:req.query.publicationState,
      eligibleOnly:req.query.eligibleOnly,
      limit:req.query.limit
    }));
  }catch(error){next(error);}
});

router.patch('/items/:id',async(req,res,next)=>{
  try{
    res.json(await setPublicationState({
      submissionId:req.params.id,
      action:String(req.body?.action||'').toUpperCase(),
      scheduledAt:req.body?.scheduledAt,
      reason:req.body?.reason,
      actorId:req.user?.id
    }));
  }catch(error){next(error);}
});

router.post('/bulk',async(req,res,next)=>{
  try{
    res.json(await bulkSetPublicationState({
      ids:req.body?.ids,
      action:String(req.body?.action||'').toUpperCase(),
      scheduledAt:req.body?.scheduledAt,
      reason:req.body?.reason,
      actorId:req.user?.id
    }));
  }catch(error){next(error);}
});

router.get('/audit',async(req,res,next)=>{
  try{res.json(await listPublicationAudit(req.query.limit));}catch(error){next(error);}
});

export default router;
