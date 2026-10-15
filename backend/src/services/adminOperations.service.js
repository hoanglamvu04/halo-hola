import { pool } from '../database/pool.js';

const PUBLIC_STATUSES="('VALID','SHORTLIST','TOP52','AWARDED')";

export async function getAdminOperationsDashboard(){
  const [summaryResult,dayResult,themeResult,locationResult,typeResult]=await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE is_demo=FALSE)::int AS total,
        COUNT(DISTINCT email) FILTER (WHERE is_demo=FALSE)::int AS creators,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND status='PENDING')::int AS pending,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND status='VALID')::int AS valid,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND status='SHORTLIST')::int AS shortlist,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND status='TOP52')::int AS top52,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND status='AWARDED')::int AS awarded,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND status='REJECTED')::int AS rejected,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND status IN ${PUBLIC_STATUSES})::int AS approved,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND (
          publication_state='PUBLISHED' OR
          (publication_state='SCHEDULED' AND publish_scheduled_at IS NOT NULL AND publish_scheduled_at<=NOW())
        ))::int AS public_now,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND hola_maps_published=TRUE AND hola_maps_sync_status='SYNCED')::int AS maps_synced,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND hola_maps_sync_status='PENDING')::int AS maps_pending,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND hola_maps_sync_status='FAILED')::int AS maps_failed,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND submission_source='WEB')::int AS source_web,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND submission_source='FACEBOOK')::int AS source_facebook,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND created_at::date=CURRENT_DATE)::int AS today,
        COUNT(*) FILTER (WHERE is_demo=FALSE AND NOT EXISTS(
          SELECT 1 FROM submission_media m WHERE m.submission_id=submissions.id
        ) AND COALESCE(TRIM(external_link),'')='')::int AS missing_media
      FROM submissions
    `),
    pool.query(`
      SELECT TO_CHAR(day,'YYYY-MM-DD') AS day,COUNT(s.id)::int AS count
      FROM generate_series(CURRENT_DATE-INTERVAL '13 days',CURRENT_DATE,INTERVAL '1 day') day
      LEFT JOIN submissions s ON s.is_demo=FALSE AND s.created_at::date=day::date
      GROUP BY day ORDER BY day ASC
    `),
    pool.query(`
      SELECT COALESCE(NULLIF(theme,''),'Chưa phân loại') AS label,COUNT(*)::int AS count
      FROM submissions WHERE is_demo=FALSE
      GROUP BY 1 ORDER BY count DESC,label ASC LIMIT 8
    `),
    pool.query(`
      SELECT COALESCE(NULLIF(location,''),'Chưa có địa điểm') AS label,COUNT(*)::int AS count
      FROM submissions WHERE is_demo=FALSE
      GROUP BY 1 ORDER BY count DESC,label ASC LIMIT 8
    `),
    pool.query(`
      SELECT COALESCE(NULLIF(type,''),'Khác') AS label,COUNT(*)::int AS count
      FROM submissions WHERE is_demo=FALSE
      GROUP BY 1 ORDER BY count DESC,label ASC
    `)
  ]);

  const summary=summaryResult.rows[0]||{};
  const total=Number(summary.total||0);
  const approved=Number(summary.approved||0);
  const publicNow=Number(summary.public_now||0);
  const mapsSynced=Number(summary.maps_synced||0);
  return {
    summary:{
      ...summary,
      valid_rate:total?Math.round((approved/total)*100):0,
      publication_rate:approved?Math.round((publicNow/approved)*100):0,
      maps_sync_rate:publicNow?Math.round((mapsSynced/publicNow)*100):0
    },
    byDay:dayResult.rows,
    byTheme:themeResult.rows,
    byLocation:locationResult.rows,
    byType:typeResult.rows
  };
}
