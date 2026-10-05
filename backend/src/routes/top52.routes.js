import { Router } from 'express';
import { pool } from '../database/pool.js';

const router=Router();
const ROUND_CODE='PRELIMINARY';

function safeNumber(value,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
}

router.get('/',async(req,res,next)=>{
  try{
    const round=(await pool.query(
      `SELECT id,code,name,status,locked_at AS "lockedAt",updated_at AS "updatedAt"
       FROM jury_rounds WHERE code=$1 LIMIT 1`,[ROUND_CODE]
    )).rows[0];

    if(!round){
      return res.json({items:[],total:0,meta:{round:null,selectedCount:0,publishedCount:0}});
    }

    const counts=(await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE s.is_demo=FALSE)::int AS "selectedCount",
        COUNT(*) FILTER (WHERE s.is_demo=FALSE AND s.allow_media_use=TRUE AND s.status IN ('TOP52','AWARDED'))::int AS "publishedCount"
      FROM jury_selections sel
      JOIN submissions s ON s.id=sel.submission_id
      WHERE sel.round_id=$1 AND sel.selection_type='TOP52'
    `,[round.id])).rows[0]||{};

    const values=[round.id];
    const conditions=[
      `sel.round_id=$1`,
      `sel.selection_type='TOP52'`,
      `s.is_demo=FALSE`,
      `s.allow_media_use=TRUE`,
      `s.status IN ('TOP52','AWARDED')`
    ];

    const q=String(req.query.q||'').trim();
    if(q){
      values.push(`%${q}%`);
      const p=`$${values.length}`;
      conditions.push(`(s.code ILIKE ${p} OR COALESCE(s.title,'') ILIKE ${p} OR s.name ILIKE ${p} OR COALESCE(s.display_name,'') ILIKE ${p} OR s.location ILIKE ${p})`);
    }
    if(req.query.theme){values.push(String(req.query.theme));conditions.push(`s.theme=$${values.length}`);}
    if(req.query.type){values.push(String(req.query.type));conditions.push(`s.type=$${values.length}`);}
    if(req.query.award==='true') conditions.push(`s.status='AWARDED'`);

    const limit=Math.max(1,Math.min(52,safeNumber(req.query.limit,16)));
    const offset=Math.max(0,safeNumber(req.query.offset,0));
    values.push(limit);const limitParam=values.length;
    values.push(offset);const offsetParam=values.length;

    const {rows}=await pool.query(`
      SELECT
        s.id,LOWER(s.code) AS slug,s.code,s.title,
        COALESCE(NULLIF(s.display_name,''),s.name) AS author,
        s.type,s.theme,s.color,s.location,s.story,s.captured_at AS "capturedAt",
        s.status,s.created_at AS "createdAt",
        sel.source AS "selectionSource",sel.selected_at AS "selectedAt",
        COALESCE(media.media,'[]'::json) AS media,
        media.image,COALESCE(media.media_count,0)::int AS "mediaCount",
        COALESCE(jury.avg_score,0)::float AS "juryScore",
        COALESCE(awards.types,'[]'::json) AS "selectionTypes",
        COUNT(*) OVER()::int AS "totalCount"
      FROM jury_selections sel
      JOIN submissions s ON s.id=sel.submission_id
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
      LEFT JOIN LATERAL (
        SELECT ROUND(AVG(js.weighted_total),2) AS avg_score
        FROM jury_scores js
        WHERE js.submission_id=s.id AND js.submitted=TRUE AND js.conflict_of_interest=FALSE
      ) jury ON TRUE
      LEFT JOIN LATERAL (
        SELECT COALESCE(json_agg(x.selection_type ORDER BY x.selection_type),'[]'::json) AS types
        FROM jury_selections x
        WHERE x.round_id=sel.round_id AND x.submission_id=s.id
          AND x.selection_type IN ('TOP3_THEME','THEME_WINNER','COLOR_WINNER','TITLE_FINALIST')
      ) awards ON TRUE
      WHERE ${conditions.join(' AND ')}
      ORDER BY CASE WHEN s.status='AWARDED' THEN 0 ELSE 1 END,
               jury.avg_score DESC NULLS LAST,sel.selected_at ASC,s.code ASC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `,values);

    res.json({
      items:rows.map(({totalCount,...item})=>item),
      total:rows[0]?.totalCount||0,
      meta:{
        round:{code:round.code,name:round.name,status:round.status,lockedAt:round.lockedAt,updatedAt:round.updatedAt},
        selectedCount:counts.selectedCount||0,
        publishedCount:counts.publishedCount||0
      }
    });
  }catch(error){next(error);}
});

export default router;
