import crypto from 'node:crypto';
import { pool, withTransaction } from '../database/pool.js';
import { replaceSubmissionFiles } from './submission.service.js';

function clean(value) { return String(value ?? '').trim(); }

async function generateQuickCode(client) {
  for (let i = 0; i < 12; i += 1) {
    const code = 'HH26-FB-' + crypto.randomInt(1, 99999).toString().padStart(5, '0');
    const { rowCount } = await client.query('SELECT 1 FROM submissions WHERE code=$1', [code]);
    if (!rowCount) return code;
  }
  return 'HH26-FB-' + Date.now().toString().slice(-5);
}

export async function createFacebookQuickSubmission(data) {
  return withTransaction(async (client) => {
    const code = await generateQuickCode(client);
    const { rows } = await client.query(
      `INSERT INTO submissions
       (code,name,display_name,email,phone,title,type,theme,color,location,story,
        rights_confirmed,allow_media_use,allow_newsletter,submission_source,
        facebook_completion_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,TRUE,$12,$13,'FACEBOOK','PENDING')
       RETURNING *`,
      [
        code,
        clean(data.name),
        clean(data.displayName) || null,
        clean(data.email).toLowerCase(),
        clean(data.phone),
        clean(data.title),
        clean(data.type),
        clean(data.theme),
        clean(data.color) || null,
        clean(data.location),
        clean(data.story) || 'Bài dự thi được khởi tạo theo luồng Facebook. Nội dung tác phẩm được đăng tại bài Facebook gắn với mã dự thi này.',
        data.allowMediaUse !== false,
        Boolean(data.allowNewsletter)
      ]
    );
    return rows[0];
  });
}

export async function getSubmissionOperationalState(code, email) {
  const { rows } = await pool.query(
    `SELECT s.id,s.code,s.title,s.name,s.display_name,s.email,s.phone,s.type,s.theme,s.color,s.location,s.story,
            s.status,s.submission_source,s.facebook_completion_status,s.facebook_completed_at,s.facebook_post_url,
            s.facebook_post_verified_at,s.facebook_reactions,s.facebook_comments,s.facebook_shares,s.facebook_metrics_updated_at,
            s.created_at,s.updated_at,
            COUNT(m.id)::int AS media_count,
            COALESCE(SUM(m.size_bytes),0)::bigint AS total_bytes
     FROM submissions s
     LEFT JOIN submission_media m ON m.submission_id=s.id
     WHERE UPPER(s.code)=UPPER($1) AND LOWER(s.email)=LOWER($2)
     GROUP BY s.id
     LIMIT 1`,
    [clean(code), clean(email)]
  );
  const row = rows[0];
  if (!row) return null;
  const missing = [];
  if (!row.phone) missing.push('PHONE');
  if (!Number(row.media_count)) missing.push('MEDIA');
  if (!row.facebook_post_url) missing.push('FACEBOOK_URL');
  if (row.facebook_completion_status !== 'CONFIRMED' && row.facebook_completion_status !== 'LEGACY') missing.push('FACEBOOK_CONFIRMATION');
  const required = ['PHONE','MEDIA','FACEBOOK_URL','FACEBOOK_CONFIRMATION'];
  const completed = required.filter(key => !missing.includes(key)).length;
  return {
    ...row,
    outreachScore: Number(row.facebook_reactions || 0) + Number(row.facebook_comments || 0) * 2 + Number(row.facebook_shares || 0) * 3,
    missing,
    completionPercent: Math.round((completed / required.length) * 100)
  };
}

export async function addFilesByIdentity({ code, email, files }) {
  const { rows } = await pool.query(
    `SELECT id FROM submissions WHERE UPPER(code)=UPPER($1) AND LOWER(email)=LOWER($2) LIMIT 1`,
    [clean(code), clean(email)]
  );
  if (!rows[0]) return null;
  return replaceSubmissionFiles(rows[0].id, files);
}

export async function updateFacebookAdmin({ id, url, verified, actor, reactions, comments, shares }) {
  const { rows } = await pool.query(
    `UPDATE submissions
     SET facebook_post_url=COALESCE(NULLIF($2,''),facebook_post_url),
         facebook_post_verified_at=CASE WHEN $3::boolean THEN COALESCE(facebook_post_verified_at,NOW()) ELSE NULL END,
         facebook_post_verified_by=CASE WHEN $3::boolean THEN $4 ELSE NULL END,
         facebook_reactions=GREATEST(0,COALESCE($5::int,facebook_reactions)),
         facebook_comments=GREATEST(0,COALESCE($6::int,facebook_comments)),
         facebook_shares=GREATEST(0,COALESCE($7::int,facebook_shares)),
         facebook_metrics_updated_at=CASE WHEN $5 IS NOT NULL OR $6 IS NOT NULL OR $7 IS NOT NULL THEN NOW() ELSE facebook_metrics_updated_at END,
         updated_at=NOW()
     WHERE id=$1
     RETURNING *`,
    [id, clean(url), Boolean(verified), clean(actor) || 'ADMIN', reactions ?? null, comments ?? null, shares ?? null]
  );
  return rows[0] || null;
}

export async function getSubmissionOperationsOverview() {
  const { rows }=await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE is_demo=FALSE)::int AS total,
      COUNT(*) FILTER (WHERE is_demo=FALSE AND submission_source='FACEBOOK')::int AS facebook_only,
      COUNT(*) FILTER (WHERE is_demo=FALSE AND NOT EXISTS (SELECT 1 FROM submission_media m WHERE m.submission_id=submissions.id))::int AS missing_media,
      COUNT(*) FILTER (WHERE is_demo=FALSE AND COALESCE(TRIM(facebook_post_url),'')='')::int AS missing_facebook,
      COUNT(*) FILTER (WHERE is_demo=FALSE AND COALESCE(TRIM(facebook_post_url),'')<>'' AND facebook_post_verified_at IS NULL)::int AS facebook_unverified,
      COUNT(*) FILTER (WHERE is_demo=FALSE AND facebook_completion_status='PENDING')::int AS facebook_pending,
      COUNT(*) FILTER (WHERE is_demo=FALSE AND facebook_post_url IS NOT NULL AND facebook_completion_status='CONFIRMED')::int AS outreach_eligible
    FROM submissions
  `);
  return rows[0] || {};
}

export async function listOperationalSubmissions({ source, issue, q, limit=120 }={}) {
  const values=[];
  const conditions=['s.is_demo=FALSE'];
  if (source && ['WEB','FACEBOOK'].includes(String(source).toUpperCase())) {
    values.push(String(source).toUpperCase());
    conditions.push(`s.submission_source=$${values.length}`);
  }
  if (q) {
    values.push(`%${clean(q)}%`);
    conditions.push(`(s.code ILIKE $${values.length} OR s.title ILIKE $${values.length} OR s.name ILIKE $${values.length} OR s.email ILIKE $${values.length} OR s.phone ILIKE $${values.length})`);
  }
  const normalizedIssue=String(issue||'').toUpperCase();
  if (normalizedIssue==='MISSING_MEDIA') conditions.push('NOT EXISTS (SELECT 1 FROM submission_media mm WHERE mm.submission_id=s.id)');
  if (normalizedIssue==='MISSING_FACEBOOK') conditions.push("COALESCE(TRIM(s.facebook_post_url),'')=''");
  if (normalizedIssue==='UNVERIFIED_FACEBOOK') conditions.push("COALESCE(TRIM(s.facebook_post_url),'')<>'' AND s.facebook_post_verified_at IS NULL");
  if (normalizedIssue==='PENDING_FACEBOOK') conditions.push("s.facebook_completion_status='PENDING'");
  if (normalizedIssue==='OUTREACH_ELIGIBLE') conditions.push("s.facebook_completion_status='CONFIRMED' AND COALESCE(TRIM(s.facebook_post_url),'')<>''");

  values.push(Math.max(1,Math.min(300,Number(limit)||120)));
  const limitParam=values.length;
  const { rows }=await pool.query(`
    SELECT s.id,s.code,s.title,s.name,s.display_name,s.email,s.phone,s.type,s.theme,s.location,s.status,
           s.submission_source,s.facebook_completion_status,s.facebook_completed_at,s.facebook_post_url,s.facebook_post_verified_at,
           s.facebook_reactions,s.facebook_comments,s.facebook_shares,s.facebook_metrics_updated_at,s.created_at,s.updated_at,
           (SELECT COUNT(*)::int FROM submission_media m WHERE m.submission_id=s.id) AS media_count
    FROM submissions s
    WHERE ${conditions.join(' AND ')}
    ORDER BY s.created_at DESC
    LIMIT $${limitParam}
  `,values);
  return rows.map(row=>({
    ...row,
    outreachScore:Number(row.facebook_reactions||0)+Number(row.facebook_comments||0)*2+Number(row.facebook_shares||0)*3,
    issues:[
      !Number(row.media_count)?'MISSING_MEDIA':null,
      !row.facebook_post_url?'MISSING_FACEBOOK':null,
      row.facebook_post_url&&!row.facebook_post_verified_at?'UNVERIFIED_FACEBOOK':null,
      row.facebook_completion_status==='PENDING'?'PENDING_FACEBOOK':null
    ].filter(Boolean)
  }));
}
