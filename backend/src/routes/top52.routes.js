import { Router } from 'express';
import { pool } from '../database/pool.js';

const router=Router();
const TAXONOMY_SEPARATOR=' • ';
const publicArtworkCondition=(alias='s')=>`(${alias}.publication_state='PUBLISHED' OR (${alias}.publication_state='SCHEDULED' AND ${alias}.publish_scheduled_at IS NOT NULL AND ${alias}.publish_scheduled_at<=NOW()))`;
const taxonomyArraySql=(alias,column)=>`string_to_array(COALESCE(${alias}.${column},''),'${TAXONOMY_SEPARATOR}')`;

function safeNumber(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
}

router.get('/',async(req,res,next)=>{
  try{
    const counts=(await pool.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE status IN ('TOP52','AWARDED') AND is_demo=FALSE
        )::int AS "selectedCount",
        COUNT(*) FILTER (
          WHERE status IN ('TOP52','AWARDED')
            AND is_demo=FALSE
            AND allow_media_use=TRUE
            AND ${publicArtworkCondition('submissions')}
        )::int AS "publishedCount"
      FROM submissions
    `)).rows[0]||{};

    const values=[];
    const conditions=[
      `s.status IN ('TOP52','AWARDED')`,
      `s.is_demo=FALSE`,
      `s.allow_media_use=TRUE`,
      publicArtworkCondition('s')
    ];

    const q=String(req.query.q||'').trim();
    if(q){
      values.push(`%${q}%`);
      const p=`$${values.length}`;
      conditions.push(`(s.code ILIKE ${p} OR COALESCE(s.title,'') ILIKE ${p} OR s.name ILIKE ${p} OR COALESCE(s.display_name,'') ILIKE ${p} OR s.location ILIKE ${p})`);
    }
    if(req.query.theme){values.push(String(req.query.theme));conditions.push(`$${values.length}=ANY(${taxonomyArraySql('s','theme')})`);}
    if(req.query.type){values.push(String(req.query.type));conditions.push(`s.type=$${values.length}`);}

    const limit=Math.max(1,Math.min(52,safeNumber(req.query.limit,16)));
    const offset=Math.max(0,safeNumber(req.query.offset,0));
    values.push(limit);const limitParam=values.length;
    values.push(offset);const offsetParam=values.length;

    const {rows}=await pool.query(`
      SELECT
        s.id,LOWER(s.code) AS slug,s.code,s.title,
        COALESCE(NULLIF(s.display_name,''),s.name) AS author,
        s.type,s.theme,s.color,
        ${taxonomyArraySql('s','theme')} AS themes,
        ${taxonomyArraySql('s','color')} AS colors,
        s.location,s.story,s.captured_at AS "capturedAt",
        s.status,s.created_at AS "createdAt",s.published_at AS "publishedAt",
        COALESCE(media.media,'[]'::json) AS media,
        media.image,COALESCE(media.media_count,0)::int AS "mediaCount",
        COUNT(*) OVER()::int AS "totalCount"
      FROM submissions s
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)::int AS media_count,
          json_agg(json_build_object(
            'id',m.id,'url','/api/public-media/'||m.id::text,
            'mimeType',m.mime_type,'originalName',m.original_name
          ) ORDER BY m.created_at ASC) AS media,
          (ARRAY_AGG('/api/public-media/'||m.id::text ORDER BY m.created_at ASC))[1] AS image
        FROM submission_media m WHERE m.submission_id=s.id
      ) media ON TRUE
      WHERE ${conditions.join(' AND ')}
      ORDER BY COALESCE(s.published_at,s.created_at) ASC,s.code ASC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `,values);

    res.json({
      items:rows.map(({totalCount,...item})=>item),
      total:rows[0]?.totalCount||0,
      meta:{
        selectedCount:counts.selectedCount||0,
        publishedCount:counts.publishedCount||0
      }
    });
  }catch(error){next(error);}
});

export default router;
