import { pool } from '../database/pool.js';

function clean(value) {
  return String(value ?? '').trim();
}

function normalizeFacebookUrl(value) {
  const raw=clean(value);
  if (!raw) return '';
  try {
    const url=new URL(raw);
    const host=url.hostname.toLowerCase();
    const allowed=host==='facebook.com'||host.endsWith('.facebook.com')||host==='fb.com'||host.endsWith('.fb.com');
    if (!allowed || !['http:','https:'].includes(url.protocol)) return '';
    url.hash='';
    return url.toString();
  } catch {
    return '';
  }
}

export async function confirmFacebookSubmission({ code, email, facebookPostUrl }) {
  const normalizedCode = clean(code).toUpperCase();
  const normalizedEmail = clean(email).toLowerCase();
  const normalizedUrl = normalizeFacebookUrl(facebookPostUrl);

  if (!normalizedCode || !normalizedEmail || !normalizedUrl) return null;

  const { rows } = await pool.query(
    `UPDATE submissions
     SET facebook_completion_status = 'CONFIRMED',
         facebook_completed_at = COALESCE(facebook_completed_at, NOW()),
         facebook_confirmation_source = 'SELF_CONFIRMED_WITH_URL',
         facebook_post_url = $3,
         updated_at = NOW()
     WHERE UPPER(code) = $1
       AND LOWER(email) = $2
     RETURNING id,
               code,
               facebook_post_url AS "facebookPostUrl",
               facebook_completion_status AS "facebookCompletionStatus",
               facebook_completed_at AS "facebookCompletedAt",
               facebook_confirmation_source AS "facebookConfirmationSource"`,
    [normalizedCode, normalizedEmail, normalizedUrl]
  );

  return rows[0] || null;
}
