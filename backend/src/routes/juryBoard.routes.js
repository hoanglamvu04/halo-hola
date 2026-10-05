import { Router } from 'express';
import { authenticateAdmin, requireRoles } from '../middleware/auth.js';
import {
  listJuryBoard,getJuryBoardSummary,createJuror,updateJuror,resetJurorPassword,deleteJuror
} from '../services/juryBoard.service.js';

const router=Router();
router.use(authenticateAdmin);
router.use(requireRoles('ADMIN'));

router.get('/',async (_req,res,next)=>{try{res.json(await listJuryBoard());}catch(error){next(error);}});
router.get('/summary',async (_req,res,next)=>{try{res.json(await getJuryBoardSummary());}catch(error){next(error);}});
router.post('/',async (req,res,next)=>{try{res.status(201).json(await createJuror(req.body||{}));}catch(error){next(error);}});
router.put('/:id',async (req,res,next)=>{try{res.json(await updateJuror(req.params.id,req.body||{}));}catch(error){next(error);}});
router.post('/:id/reset-password',async (req,res,next)=>{try{res.json(await resetJurorPassword(req.params.id,req.body?.password));}catch(error){next(error);}});
router.delete('/:id',async (req,res,next)=>{try{res.json(await deleteJuror(req.params.id));}catch(error){next(error);}});

export default router;
