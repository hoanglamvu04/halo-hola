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
