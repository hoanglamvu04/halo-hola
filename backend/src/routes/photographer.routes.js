import fs from 'node:fs/promises';
import { Router } from 'express';
import { authenticate, requireRoles } from '../middleware/auth.js';
import { photographerUpload } from '../middleware/upload.js';
import {
  listPhotographerPlaces,
  createPhotographerShoot,
  listPhotographerShoots,
  updatePhotographerShoot,
  storePhotographerAssets,
  listPhotographerAssets,
  deletePhotographerAsset
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

router.get('/assets',async (req,res,next)=>{
  try{
    res.json(await listPhotographerAssets(req.user.id,{shootId:req.query.shootId}));
  }catch(error){next(error);}
});

router.post('/shoots/:id/assets',photographerUpload.array('files',30),async (req,res,next)=>{
  const files=Array.isArray(req.files)?req.files:[];
  try{
    req.setTimeout?.(10*60*1000);
    res.setTimeout?.(10*60*1000);
    const stored=await storePhotographerAssets({
      user:req.user,
      shootId:req.params.id,
      files
    });
    res.status(201).json(stored);
  }catch(error){
    await Promise.all(files.map(file=>fs.unlink(file.path).catch(()=>{})));
    next(error);
  }
});

router.delete('/assets/:id',async (req,res,next)=>{
  try{res.json(await deletePhotographerAsset(req.user.id,req.params.id));}
  catch(error){next(error);}
});

export default router;
