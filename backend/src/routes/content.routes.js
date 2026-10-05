import { Router } from 'express';
import { pool } from '../database/pool.js';
import { getMediaDownloadUrl } from '../services/submission.service.js';

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

router.get('/themes', async (_req,res,next)=>{
  try{
    const {rows}=await pool.query(`
      SELECT t.id,t.slug,t.title,t.description,t.intro,t.image,t.color,
             t.location_label AS "locationLabel",t.sort_order AS "sortOrder",
             COUNT(s.id) FILTER (WHERE s.status IN ('TOP52','AWARDED') AND s.is_demo=FALSE)::int AS "artworkCount"
      FROM themes t
      LEFT JOIN submissions s ON s.theme=t.title AND s.allow_media_use=TRUE
      WHERE t.published=TRUE
      GROUP BY t.id
      ORDER BY t.sort_order ASC,t.id ASC
    `);
    res.json(rows);
  }catch(error){next(error);}
});

router.get('/themes/:slug', async (req,res,next)=>{
  try{
    const {rows}=await pool.query(`
      SELECT t.id,t.slug,t.title,t.description,t.intro,t.image,t.color,
             t.location_label AS "locationLabel",t.sort_order AS "sortOrder",
             COUNT(s.id) FILTER (WHERE s.status IN ('TOP52','AWARDED') AND s.is_demo=FALSE)::int AS "artworkCount"
      FROM themes t
      LEFT JOIN submissions s ON s.theme=t.title AND s.allow_media_use=TRUE
      WHERE t.published=TRUE AND t.slug=$1
      GROUP BY t.id
      LIMIT 1
    `,[req.params.slug]);
    if(!rows[0]) return res.status(404).json({error:'Không tìm thấy chủ đề.'});
    res.json(rows[0]);
  }catch(error){next(error);}
});

router.get('/colors', async (_req,res,next)=>{
  try{
    const {rows}=await pool.query(`
      SELECT id,slug,name,color_value AS color,story,sort_order AS "sortOrder"
      FROM theme_colors
      WHERE published=TRUE
      ORDER BY sort_order ASC,id ASC
    `);
    res.json(rows);
  }catch(error){next(error);}
});

router.get('/public-media/:id', async (req,res,next)=>{
  try{
    const allowed=await pool.query(`
      SELECT m.id
      FROM submission_media m
      JOIN submissions s ON s.id=m.submission_id
      WHERE m.id=$1 AND s.status IN ('TOP52','AWARDED') AND s.is_demo=FALSE AND s.allow_media_use=TRUE
      LIMIT 1
    `,[req.params.id]);
    if(!allowed.rows[0]) return res.status(404).json({error:'Không tìm thấy media công khai.'});
    const media=await getMediaDownloadUrl(req.params.id);
    if(!media?.url) return res.status(404).json({error:'Không tìm thấy file media.'});
    return res.redirect(302,media.url);
  }catch(error){next(error);}
});

router.get('/artworks', async (req,res,next)=>{
  try{
    const values=[];
    const conditions=["s.status IN ('TOP52','AWARDED')","s.is_demo=FALSE","s.allow_media_use=TRUE"];
    if(req.query.theme){values.push(String(req.query.theme));conditions.push(`s.theme=$${values.length}`);}
    if(req.query.type){values.push(String(req.query.type));conditions.push(`s.type=$${values.length}`);}
    if(req.query.color){values.push(String(req.query.color));conditions.push(`s.color=$${values.length}`);}
    const limit=Math.max(1,Math.min(100,Number(req.query.limit)||52));
    values.push(limit);
    const {rows}=await pool.query(`
      SELECT s.id,LOWER(s.code) AS slug,s.code,s.title,
             COALESCE(NULLIF(s.display_name,''),s.name) AS author,
             s.type,s.theme,s.color,s.location,s.story,s.captured_at AS "capturedAt",
             s.status,s.created_at AS "createdAt",
             COALESCE(media.media,'[]'::json) AS media,
             media.image,
             COALESCE(jury.avg_score,0)::float AS "juryScore"
      FROM submissions s
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object('id',m.id,'url','/api/public-media/'||m.id::text,'mimeType',m.mime_type,'originalName',m.original_name) ORDER BY m.created_at ASC) AS media,
               (ARRAY_AGG('/api/public-media/'||m.id::text ORDER BY m.created_at ASC))[1] AS image
        FROM submission_media m WHERE m.submission_id=s.id
      ) media ON TRUE
      LEFT JOIN LATERAL (
        SELECT ROUND(AVG(js.weighted_total),2) AS avg_score
        FROM jury_scores js
        WHERE js.submission_id=s.id AND js.submitted=TRUE AND js.conflict_of_interest=FALSE
      ) jury ON TRUE
      WHERE ${conditions.join(' AND ')}
      ORDER BY CASE WHEN s.status='AWARDED' THEN 0 ELSE 1 END,jury.avg_score DESC NULLS LAST,s.created_at ASC
      LIMIT $${values.length}
    `,values);
    res.json(rows);
  }catch(error){next(error);}
});

router.get('/artworks/:slug', async (req,res,next)=>{
  try{
    const {rows}=await pool.query(`
      SELECT s.id,LOWER(s.code) AS slug,s.code,s.title,
             COALESCE(NULLIF(s.display_name,''),s.name) AS author,
             s.type,s.theme,s.color,s.location,s.story,s.captured_at AS "capturedAt",
             s.status,s.created_at AS "createdAt",
             COALESCE(media.media,'[]'::json) AS media,
             media.image,
             COALESCE(jury.avg_score,0)::float AS "juryScore"
      FROM submissions s
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object('id',m.id,'url','/api/public-media/'||m.id::text,'mimeType',m.mime_type,'originalName',m.original_name) ORDER BY m.created_at ASC) AS media,
               (ARRAY_AGG('/api/public-media/'||m.id::text ORDER BY m.created_at ASC))[1] AS image
        FROM submission_media m WHERE m.submission_id=s.id
      ) media ON TRUE
      LEFT JOIN LATERAL (
        SELECT ROUND(AVG(js.weighted_total),2) AS avg_score
        FROM jury_scores js
        WHERE js.submission_id=s.id AND js.submitted=TRUE AND js.conflict_of_interest=FALSE
      ) jury ON TRUE
      WHERE LOWER(s.code)=$1 AND s.status IN ('TOP52','AWARDED') AND s.is_demo=FALSE AND s.allow_media_use=TRUE
      LIMIT 1
    `,[String(req.params.slug||'').toLowerCase()]);
    if(!rows[0]) return res.status(404).json({error:'Không tìm thấy tác phẩm công khai.'});
    res.json(rows[0]);
  }catch(error){next(error);}
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
