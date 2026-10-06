import { Router } from 'express';
import { pool } from '../database/pool.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();
const EVENT_TYPES = new Set([
  'page_view','cta_click','submit_cta','map_open','top52_open','share_click','outbound_click'
]);

function clean(value,max=500){
  const text=String(value||'').trim();
  return text ? text.slice(0,max) : null;
}

router.post('/analytics/events', async (req,res,next)=>{
  try{
    const eventType=clean(req.body?.eventType,64);
    if(!eventType || !EVENT_TYPES.has(eventType)) return res.status(202).json({ok:true,ignored:true});

    const path=clean(req.body?.path,500);
    const target=clean(req.body?.target,500);
    const sessionId=clean(req.body?.sessionId,80);
    const referrer=clean(req.body?.referrer,500);
    const metadata=req.body?.metadata && typeof req.body.metadata==='object' && !Array.isArray(req.body.metadata)
      ? req.body.metadata : {};

    await pool.query(`
      INSERT INTO analytics_events(event_type,path,target,session_id,referrer,metadata)
      VALUES($1,$2,$3,$4,$5,$6::jsonb)
    `,[eventType,path,target,sessionId,referrer,JSON.stringify(metadata)]);

    res.status(202).json({ok:true});
  }catch(error){next(error);}
});

router.get('/admin/analytics/summary', authenticateAdmin, async (req,res,next)=>{
  try{
    const days=Math.max(1,Math.min(90,Number(req.query.days)||30));
    const [overview,events,paths,daily]=await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE created_at>=CURRENT_DATE)::int AS today,
          COUNT(*) FILTER (WHERE created_at>=NOW()-INTERVAL '7 days')::int AS last7,
          COUNT(*) FILTER (WHERE created_at>=NOW()-INTERVAL '30 days')::int AS last30,
          COUNT(DISTINCT session_id) FILTER (WHERE created_at>=NOW()-INTERVAL '30 days' AND session_id IS NOT NULL)::int AS visitors30,
          COUNT(*) FILTER (WHERE event_type='page_view' AND created_at>=NOW()-INTERVAL '30 days')::int AS pageviews30,
          COUNT(*) FILTER (WHERE event_type='submit_cta' AND created_at>=NOW()-INTERVAL '30 days')::int AS submitClicks30,
          COUNT(*) FILTER (WHERE event_type='map_open' AND created_at>=NOW()-INTERVAL '30 days')::int AS mapOpens30,
          COUNT(*) FILTER (WHERE event_type='top52_open' AND created_at>=NOW()-INTERVAL '30 days')::int AS top52Opens30,
          COUNT(*) FILTER (WHERE event_type='share_click' AND created_at>=NOW()-INTERVAL '30 days')::int AS shares30
        FROM analytics_events
      `),
      pool.query(`
        SELECT event_type AS event,COUNT(*)::int AS count
        FROM analytics_events
        WHERE created_at>=NOW()-make_interval(days=>$1::int)
        GROUP BY event_type ORDER BY count DESC,event_type ASC LIMIT 20
      `,[days]),
      pool.query(`
        SELECT COALESCE(NULLIF(path,''),'/') AS path,COUNT(*)::int AS views,
               COUNT(DISTINCT session_id)::int AS visitors
        FROM analytics_events
        WHERE event_type='page_view' AND created_at>=NOW()-make_interval(days=>$1::int)
        GROUP BY COALESCE(NULLIF(path,''),'/') ORDER BY views DESC LIMIT 20
      `,[days]),
      pool.query(`
        SELECT to_char(d.day,'YYYY-MM-DD') AS date,
               COALESCE(x.pageviews,0)::int AS pageviews,
               COALESCE(x.visitors,0)::int AS visitors
        FROM generate_series(CURRENT_DATE-($1::int-1),CURRENT_DATE,'1 day'::interval) AS d(day)
        LEFT JOIN LATERAL (
          SELECT COUNT(*) FILTER (WHERE event_type='page_view') AS pageviews,
                 COUNT(DISTINCT session_id) AS visitors
          FROM analytics_events
          WHERE created_at>=d.day AND created_at<d.day+INTERVAL '1 day'
        ) x ON TRUE
        ORDER BY d.day ASC
      `,[Math.min(days,30)])
    ]);

    res.json({days,overview:overview.rows[0]||{},events:events.rows,paths:paths.rows,daily:daily.rows});
  }catch(error){next(error);}
});

export default router;
