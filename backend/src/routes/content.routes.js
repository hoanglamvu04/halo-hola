import { Router } from 'express';
import { pool } from '../database/pool.js';

const router = Router();

router.get('/places', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,slug,name,category,lat,lng,image,description,tags,sort_order FROM places WHERE published = TRUE ORDER BY sort_order ASC, name ASC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/tours', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id,number,title,dates,kicker,description,image,status,capacity,
              itinerary,highlights,stops,location,duration_label,audience_label,sort_order
       FROM tours WHERE status <> 'DRAFT' ORDER BY sort_order ASC, number ASC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/stories', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id,slug,title,author,role,category,location,read_time,excerpt,lead,quote,
              content,image,body,gallery,featured,sort_order,created_at,updated_at
       FROM stories WHERE published = TRUE
       ORDER BY featured DESC, sort_order ASC, created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/stories/:slug', async (req,res,next)=>{
  try{
    const { rows }=await pool.query(
      `SELECT id,slug,title,author,role,category,location,read_time,excerpt,lead,quote,
              content,image,body,gallery,featured,sort_order,created_at,updated_at
       FROM stories WHERE slug=$1 AND published=TRUE LIMIT 1`,
      [req.params.slug]
    );
    if(!rows[0]) return res.status(404).json({error:'Không tìm thấy câu chuyện.'});
    res.json(rows[0]);
  }catch(error){next(error);}
});

router.get('/partners', async (_req,res,next)=>{
  try{
    const { rows }=await pool.query(
      'SELECT id,name,tier,description,logo,website,sort_order FROM partners WHERE published=TRUE ORDER BY sort_order ASC,name ASC'
    );
    res.json(rows);
  }catch(error){next(error);}
});

router.get('/site-settings', async (_req,res,next)=>{
  try{
    const { rows }=await pool.query('SELECT setting_key,value FROM site_settings ORDER BY setting_key');
    res.json(Object.fromEntries(rows.map(r=>[r.setting_key,r.value])));
  }catch(error){next(error);}
});

export default router;
