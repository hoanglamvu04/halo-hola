import { Router } from 'express';
import { getHomepagePublicObject, resolveSiteAsset } from '../services/siteContent.service.js';
import { AppError } from '../utils/AppError.js';

const router=Router();

router.get('/site/homepage', async (_req,res,next)=>{
  try{
    res.json(await getHomepagePublicObject());
  }catch(error){ next(error); }
});

router.get('/site-assets/:id', async (req,res,next)=>{
  try{
    const asset=await resolveSiteAsset(req.params.id);
    if(!asset) throw new AppError('Không tìm thấy ảnh.',404);
    res.set('Cache-Control','public, max-age=300');
    res.redirect(asset.url);
  }catch(error){ next(error); }
});

export default router;
