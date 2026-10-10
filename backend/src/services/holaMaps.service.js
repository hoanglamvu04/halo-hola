import crypto from 'node:crypto';
import { pool } from '../database/pool.js';
import { env } from '../config/env.js';

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 5000, 30000];

function trimSlash(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

function safeText(value, max = 4000) {
  const text = String(value ?? '').trim();
  return text ? text.slice(0, max) : null;
}

function isImageMime(value) {
  return String(value || '').toLowerCase().startsWith('image/');
}

function authorId(email = '') {
  return crypto.createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex').slice(0, 32);
}

function configured() {
  return Boolean(trimSlash(env.holaMapsBaseUrl) && env.holaMapsHaloSecret);
}

async function request(path, options = {}) {
  if (!configured()) throw new Error('HOLA_MAPS_BASE_URL hoặc HOLA_MAPS_HALO_SECRET chưa được cấu hình.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.holaMapsSyncTimeoutMs);
  try {
    const response = await fetch(`${trimSlash(env.holaMapsBaseUrl)}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Halo-Hola-Key': env.holaMapsHaloSecret,
        ...(options.headers || {})
      }
    });
    const raw = await response.text();
    let body = null;
    try { body = raw ? JSON.parse(raw) : null; } catch { body = raw || null; }
    if (!response.ok) {
      const detail = typeof body === 'object' && body ? (body.message || body.error) : body;
      throw new Error(`Hola Maps ${response.status}${detail ? `: ${detail}` : ''}`);
    }
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncHaloPost(post) {
  return request('/api/halo/v1/posts', {
    method: 'POST',
    body: JSON.stringify(post)
  });
}

export async function deleteHaloPost(postId) {
  return request(`/api/halo/v1/posts/${encodeURIComponent(String(postId))}`, {
    method: 'DELETE'
  });
}

export function buildHolaMapsPayload(submission, media = []) {
  if (!submission) return null;
  const images = media.filter(item => isImageMime(item.mime_type));
  const hasPlace = Boolean(safeText(submission.hola_map_place_id, 160));
  const lat = Number(submission.location_lat);
  const lng = Number(submission.location_lng);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  if (!images.length || (!hasPlace && !hasCoords)) return null;

  const siteUrl = trimSlash(env.haloHolaSiteUrl || env.corsOrigins?.[0] || 'https://halohola.xspace.vn');
  const apiBase = trimSlash(env.publicBaseUrl);
  const payload = {
    postId: String(submission.id),
    user: {
      id: authorId(submission.email),
      name: safeText(submission.display_name || submission.name, 240)
    },
    caption: safeText(submission.story, 4000),
    sourceUrl: siteUrl ? `${siteUrl}/tra-cuu?code=${encodeURIComponent(submission.code)}` : null,
    postedAt: submission.created_at ? new Date(submission.created_at).toISOString() : new Date().toISOString(),
    location: {
      ...(hasPlace ? { placeId: String(submission.hola_map_place_id) } : { spotId: `halo-submission:${submission.id}` }),
      ...(hasCoords ? { lat, lng } : {}),
      label: safeText(submission.location, 240) || 'Vị trí HALO HOLA',
      address: safeText(submission.location_address, 500)
    },
    media: images.map(item => ({
      id: String(item.id),
      url: `${apiBase}/api/submissions/media/${item.id}/halo`,
      thumbnailUrl: `${apiBase}/api/submissions/media/${item.id}/halo`
    })),
    metadata: {
      code: submission.code,
      title: submission.title || null,
      type: submission.type || null,
      theme: submission.theme || null,
      locationSource: submission.location_source || null
    }
  };
  return payload;
}

async function loadSubmissionForSync(submissionId) {
  const { rows } = await pool.query(
    `SELECT s.*,
       COALESCE(json_agg(json_build_object(
         'id',m.id,'mime_type',m.mime_type,'url',m.url,'storage_provider',m.storage_provider,
         'bucket',m.bucket,'object_key',m.object_key
       ) ORDER BY m.created_at) FILTER (WHERE m.id IS NOT NULL),'[]'::json) AS media
     FROM submissions s
     LEFT JOIN submission_media m ON m.submission_id=s.id
     WHERE s.id=$1
     GROUP BY s.id`,
    [submissionId]
  );
  return rows[0] || null;
}

async function setSubmissionSyncState(submissionId, status, error = null) {
  if (!submissionId) return;
  await pool.query(
    `UPDATE submissions
     SET hola_maps_sync_status=$2,
         hola_maps_last_sync_error=$3,
         hola_maps_last_synced_at=CASE WHEN $2='SYNCED' THEN NOW() ELSE hola_maps_last_synced_at END,
         updated_at=NOW()
     WHERE id=$1`,
    [submissionId, status, error ? String(error).slice(0, 2000) : null]
  );
}

async function executeJob(job) {
  if (job.action === 'DELETE') {
    await deleteHaloPost(job.external_post_id);
    return { skipped: false };
  }

  const submission = await loadSubmissionForSync(job.submission_id);
  if (!submission) return { skipped: true, reason: 'Submission không còn tồn tại.' };
  const payload = buildHolaMapsPayload(submission, submission.media || []);
  if (!payload) return { skipped: true, reason: 'Bài chưa có ảnh hoặc chưa có vị trí có cấu trúc.' };
  await syncHaloPost(payload);
  return { skipped: false };
}

async function runJob(jobId) {
  const { rows } = await pool.query('SELECT * FROM hola_maps_sync_jobs WHERE id=$1 LIMIT 1', [jobId]);
  const job = rows[0];
  if (!job || job.status === 'SYNCED') return;

  const attempt = Number(job.attempts || 0) + 1;
  try {
    const result = await executeJob(job);
    if (result.skipped) {
      await pool.query(
        `UPDATE hola_maps_sync_jobs SET status='SYNCED', attempts=$2, last_error=$3, updated_at=NOW() WHERE id=$1`,
        [job.id, attempt, result.reason]
      );
      if (job.submission_id) await setSubmissionSyncState(job.submission_id, 'PENDING', null);
      return;
    }

    await pool.query(
      `UPDATE hola_maps_sync_jobs SET status='SYNCED', attempts=$2, last_error=NULL, updated_at=NOW() WHERE id=$1`,
      [job.id, attempt]
    );
    if (job.submission_id) await setSubmissionSyncState(job.submission_id, 'SYNCED', null);
  } catch (error) {
    const message = error?.name === 'AbortError' ? 'Hola Maps sync timeout.' : (error?.message || String(error));
    const finalFailure = attempt >= MAX_ATTEMPTS;
    const delay = RETRY_DELAYS_MS[Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1)];
    await pool.query(
      `UPDATE hola_maps_sync_jobs
       SET status=$2, attempts=$3, last_error=$4,
           next_attempt_at=CASE WHEN $2='FAILED' THEN next_attempt_at ELSE NOW() + ($5::int * interval '1 millisecond') END,
           updated_at=NOW()
       WHERE id=$1`,
      [job.id, finalFailure ? 'FAILED' : 'PENDING', attempt, message.slice(0, 2000), delay]
    );
    if (job.submission_id) await setSubmissionSyncState(job.submission_id, finalFailure ? 'FAILED' : 'PENDING', message);
    console.warn(`[Hola Maps sync] ${job.action} ${job.external_post_id} attempt ${attempt} failed:`, message);
    if (!finalFailure) setTimeout(() => runJob(job.id).catch(err => console.warn('[Hola Maps sync retry]', err.message)), delay).unref?.();
  }
}

export function kickHolaMapsSyncJob(jobId) {
  if (!jobId) return;
  setImmediate(() => runJob(jobId).catch(error => console.warn('[Hola Maps sync job]', error.message)));
}

export async function enqueueHolaMapsSync({ submissionId = null, externalPostId, action = 'UPSERT' }) {
  if (!externalPostId) throw new Error('externalPostId is required');
  const { rows } = await pool.query(
    `INSERT INTO hola_maps_sync_jobs(submission_id,external_post_id,action,status,next_attempt_at)
     VALUES($1,$2,$3,'PENDING',NOW()) RETURNING id`,
    [submissionId, String(externalPostId), action]
  );
  if (submissionId && action === 'UPSERT') await setSubmissionSyncState(submissionId, 'PENDING', null);
  const id = rows[0].id;
  kickHolaMapsSyncJob(id);
  return id;
}

export async function queueSubmissionSync(submissionId) {
  const submission = await loadSubmissionForSync(submissionId);
  if (!submission) return null;
  const payload = buildHolaMapsPayload(submission, submission.media || []);
  if (!payload) return null;
  return enqueueHolaMapsSync({ submissionId, externalPostId: submission.id, action: 'UPSERT' });
}

export async function queueSubmissionDelete(externalPostId) {
  return enqueueHolaMapsSync({ submissionId: null, externalPostId, action: 'DELETE' });
}

export async function recoverPendingHolaMapsSyncJobs(limit = 50) {
  const { rows } = await pool.query(
    `SELECT id FROM hola_maps_sync_jobs
     WHERE status='PENDING' AND next_attempt_at<=NOW()
     ORDER BY created_at ASC LIMIT $1`,
    [Math.max(1, Math.min(Number(limit) || 50, 200))]
  );
  for (const row of rows) kickHolaMapsSyncJob(row.id);
  return rows.length;
}
