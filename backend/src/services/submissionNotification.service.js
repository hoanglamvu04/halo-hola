import { pool } from '../database/pool.js';
import { sendSubmissionStatusUpdate } from './mail.service.js';

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase();
}

export async function getSubmissionNotificationTargetById(id) {
  const { rows } = await pool.query(
    `SELECT id,code,title,name,display_name,email,status,is_demo,updated_at
     FROM submissions
     WHERE id=$1
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function getSubmissionNotificationTargetByCode(code) {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const { rows } = await pool.query(
    `SELECT id,code,title,name,display_name,email,status,is_demo,updated_at
     FROM submissions
     WHERE UPPER(code)=$1
     LIMIT 1`,
    [normalized]
  );
  return rows[0] || null;
}

export async function getPendingTop52NotificationIds() {
  const { rows } = await pool.query(
    `SELECT s.id
     FROM submissions s
     JOIN jury_selections js ON js.submission_id=s.id
     JOIN jury_rounds jr ON jr.id=js.round_id
     WHERE jr.code='PRELIMINARY'
       AND js.selection_type='TOP52'
       AND s.status NOT IN ('TOP52','AWARDED')
       AND s.is_demo=FALSE`
  );
  return rows.map((row) => row.id);
}

export async function sendStatusNotificationForSubmission(submission) {
  if (!submission?.email || !submission?.code) {
    return { skipped: true, reason: 'MISSING_RECIPIENT' };
  }
  if (submission.is_demo) {
    return { skipped: true, reason: 'DEMO_SUBMISSION' };
  }
  return sendSubmissionStatusUpdate({
    to: submission.email,
    name: submission.display_name || submission.name || 'bạn',
    code: submission.code,
    title: submission.title,
    status: submission.status
  });
}

export async function sendStatusNotificationById(id) {
  const submission = await getSubmissionNotificationTargetById(id);
  if (!submission) return null;
  const delivery = await sendStatusNotificationForSubmission(submission);
  return { submission, delivery };
}

export async function sendStatusNotificationByCode(code) {
  const submission = await getSubmissionNotificationTargetByCode(code);
  if (!submission) return null;
  const delivery = await sendStatusNotificationForSubmission(submission);
  return { submission, delivery };
}

export async function sendStatusNotificationsByIds(ids = []) {
  const uniqueIds = [...new Set(ids.filter(Boolean).map(String))];
  if (!uniqueIds.length) return { sent: 0, skipped: 0, failed: 0 };

  const { rows } = await pool.query(
    `SELECT id,code,title,name,display_name,email,status,is_demo,updated_at
     FROM submissions
     WHERE id=ANY($1::uuid[])`,
    [uniqueIds]
  );

  const results = await Promise.allSettled(rows.map((submission) =>
    sendStatusNotificationForSubmission(submission)
  ));

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const result of results) {
    if (result.status === 'rejected') {
      failed += 1;
    } else if (result.value?.skipped) {
      skipped += 1;
    } else {
      sent += 1;
    }
  }
  return { sent, skipped, failed };
}
