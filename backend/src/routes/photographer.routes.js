import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import {
  listPhotographerPlaces,
  createPhotographerShoot,
  listPhotographerShoots,
  updatePhotographerShoot
} from '../services/photographer.service.js';

const router=Router();

router.use(authenticate);
router.use(requireRoles('PHOTOGRAPHER','MODERATOR','ADMIN'));

router.get('/places',async (_req,res,next)=>{
  try{res.json(await listPhotographerPlaces());}catch(error){next(error);}
});

router.get('/shoots',async (req,res,next)=>{
  try{res.json(await listPhotographerShoots(req.user.id));}catch(error){next(error);}
});

router.post('/shoots',async (req,res,next)=>{
  try{res.status(201).json(await createPhotographerShoot(req.user.id,req.body||{}));}
  catch(error){next(error);}
});

router.patch('/shoots/:id',async (req,res,next)=>{
  try{res.json(await updatePhotographerShoot(req.user.id,req.params.id,req.body||{}));}
  catch(error){next(error);}
});

export default router;
