import { pool } from '../database/pool.js';

function clean(value) {
  return String(value ?? '').trim();
}

export async function confirmFacebookSubmission({ code, email }) {
  const normalizedCode = clean(code).toUpperCase();
  const normalizedEmail = clean(email).toLowerCase();

  if (!normalizedCode || !normalizedEmail) return null;

  const { rows } = await pool.query(
    `UPDATE submissions
     SET facebook_completion_status = 'CONFIRMED',
         facebook_completed_at = COALESCE(facebook_completed_at, NOW()),
         facebook_confirmation_source = 'SELF_CONFIRMED',
         updated_at = NOW()
     WHERE UPPER(code) = $1
       AND LOWER(email) = $2
     RETURNING id,
               code,
               facebook_completion_status AS "facebookCompletionStatus",
               facebook_completed_at AS "facebookCompletedAt",
               facebook_confirmation_source AS "facebookConfirmationSource"`,
    [normalizedCode, normalizedEmail]
  );

  return rows[0] || null;
}
