import { pool } from '../database/pool.js';
import { sendSubmissionStatusUpdate } from './mail.service.js';

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase();
}

async function writeNotificationLog({submissionId,kind='STATUS',status,recipient,deliveryStatus,detail}){
  if(!submissionId||!recipient)return;
  try{
    await pool.query(
      `INSERT INTO submission_notification_logs(submission_id,kind,status,recipient,delivery_status,detail)
       VALUES($1,$2,$3,$4,$5,$6)`,
      [submissionId,kind,status||null,String(recipient).toLowerCase(),deliveryStatus,String(detail||'').slice(0,1000)||null]
    );
  }catch(error){
    console.warn('Notification log write failed:',error.message);
  }
}

export async function logReceivedNotification({submissionId,email,delivery,error}){
  const deliveryStatus=error?'FAILED':delivery?.skipped?'SKIPPED':'SENT';
  const detail=error?.message||delivery?.reason||null;
  await writeNotificationLog({
    submissionId,
    kind:'RECEIVED',
    status:'PENDING',
    recipient:email,
    deliveryStatus,
    detail
  });
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
  try{
    const delivery=await sendSubmissionStatusUpdate({
      to: submission.email,
      name: submission.display_name || submission.name || 'bạn',
      code: submission.code,
      title: submission.title,
      status: submission.status
    });
    await writeNotificationLog({
      submissionId:submission.id,
      kind:'STATUS',
      status:submission.status,
      recipient:submission.email,
      deliveryStatus:delivery?.skipped?'SKIPPED':'SENT',
      detail:delivery?.reason||null
    });
    return delivery;
  }catch(error){
    await writeNotificationLog({
      submissionId:submission.id,
      kind:'STATUS',
      status:submission.status,
      recipient:submission.email,
      deliveryStatus:'FAILED',
      detail:error.message
    });
    throw error;
  }
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
