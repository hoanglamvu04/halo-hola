import { Router } from 'express';
import { authenticateAdmin, requireRoles } from '../middleware/auth.js';
import {
  listPhotographers,
  createPhotographer,
  updatePhotographer,
  resetPhotographerPassword,
  listTeamShoots
} from '../services/photographer.service.js';

const router=Router();
router.use(authenticateAdmin);
router.use(requireRoles('ADMIN'));

router.get('/',async (_req,res,next)=>{
  try{res.json(await listPhotographers());}catch(error){next(error);}
});

router.post('/',async (req,res,next)=>{
  try{res.status(201).json(await createPhotographer(req.body||{}));}catch(error){next(error);}
});

router.put('/:id',async (req,res,next)=>{
  try{res.json(await updatePhotographer(req.params.id,req.body||{}));}catch(error){next(error);}
});

router.post('/:id/reset-password',async (req,res,next)=>{
  try{res.json(await resetPhotographerPassword(req.params.id,req.body?.password));}catch(error){next(error);}
});

router.get('/workspace/shoots',async (req,res,next)=>{
  try{res.json(await listTeamShoots({photographerId:req.query.photographerId}));}catch(error){next(error);}
});

export default router;
