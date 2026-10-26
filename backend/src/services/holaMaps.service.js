import crypto from 'node:crypto';
import { pool } from '../database/pool.js';
import { env } from '../config/env.js';
import { getConnectionConfig, isConnectionConfigured } from './connectionSettings.service.js';

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 5000, 30000];
const PUBLIC_ELIGIBLE_STATUSES = new Set(['VALID','SHORTLIST','TOP52','AWARDED']);

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

function hasCoordinate(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function truthy(value) {
  return value === true || String(value).toLowerCase() === 'true';
}

function authorId(email = '') {
  return crypto.createHash('sha256').update(String(email).trim().toLowerCase()).digest('hex').slice(0, 32);
}

function configured() {
  return isConnectionConfigured('hola_maps');
}

function isPublicationEffective(submission, at = Date.now()) {
  if (submission?.publication_state === 'PUBLISHED') return true;
  if (submission?.publication_state !== 'SCHEDULED' || !submission?.publish_scheduled_at) return false;
  const when = new Date(submission.publish_scheduled_at).getTime();
  return Number.isFinite(when) && when <= at;
}

function isBaseEligible(submission) {
  if (!submission || !PUBLIC_ELIGIBLE_STATUSES.has(submission.status)) return false;
  if (truthy(submission.is_demo)) return false;
  if (!truthy(submission.allow_media_use)) return false;
  if (!truthy(submission.rights_confirmed)) return false;
  if (!truthy(submission.image_consent_confirmed)) return false;
  if (truthy(submission.is_minor) && !truthy(submission.guardian_consent)) return false;
  return true;
}

export function isSubmissionEligibleForHolaMaps(submission, at = Date.now()) {
  return isBaseEligible(submission) && isPublicationEffective(submission, at);
}

async function request(path, options = {}) {
  if (!configured()) throw new Error('HOLA_MAPS_BASE_URL hoặc HOLA_MAPS_HALO_SECRET chưa được cấu hình.');
  const controller = new AbortController();
  const config = getConnectionConfig('hola_maps');
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetch(`${trimSlash(config.baseUrl)}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Halo-Hola-Key': config.secret,
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

function mapPublicMetadata(result) {
  if (!result || typeof result !== 'object') return { spotId: null, publicUrl: null };
  const spotId = safeText(
    result.spotId ?? result.spot_id ?? result.spot?.id ?? result.data?.spotId ?? result.data?.spot?.id,
    240
  );
  const explicitUrl = safeText(
    result.publicUrl ?? result.public_url ?? result.url ?? result.spotUrl ?? result.spot_url ?? result.data?.publicUrl,
    1000
  );
  const base = trimSlash(getConnectionConfig('hola_maps').baseUrl);
  const publicUrl = explicitUrl || (spotId && base ? `${base}/halo?spot=${encodeURIComponent(spotId)}` : null);
  return { spotId, publicUrl };
}

export function buildHolaMapsPayload(submission, media = []) {
  if (!submission) return null;
  const images = media.filter(item => isImageMime(item.mime_type));
  const hasPlace = Boolean(safeText(submission.hola_map_place_id, 160));
  const hasCoords = hasCoordinate(submission.location_lat) && hasCoordinate(submission.location_lng);
  const lat = hasCoords ? Number(submission.location_lat) : null;
  const lng = hasCoords ? Number(submission.location_lng) : null;
  if (!images.length || (!hasPlace && !hasCoords)) return null;

  const siteUrl = trimSlash(env.haloHolaSiteUrl || env.corsOrigins?.[0] || 'https://halohola.vn');
  const apiBase = trimSlash(env.publicBaseUrl);
  return {
    postId: String(submission.id),
    user: {
      id: authorId(submission.email),
      name: safeText(submission.display_name || submission.name, 240)
    },
    caption: safeText(submission.story, 4000),
    sourceUrl: siteUrl ? `${siteUrl}/tac-pham/${String(submission.code || '').toLowerCase()}` : null,
    postedAt: submission.published_at
      ? new Date(submission.published_at).toISOString()
      : (submission.created_at ? new Date(submission.created_at).toISOString() : new Date().toISOString()),
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
      source: 'HALO_HOLA',
      code: submission.code,
      title: submission.title || null,
      type: submission.type || null,
      theme: submission.theme || null,
      locationSource: submission.location_source || null,
      publicationState: submission.publication_state || null
    }
  };
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

async function setSubmissionSyncState(submissionId, status, error = null, published = null, mapMeta = null) {
  if (!submissionId) return;
  const clearMapMeta = published === false;
  await pool.query(
    `UPDATE submissions
     SET hola_maps_sync_status=$2,
         hola_maps_last_sync_error=$3,
         hola_maps_last_synced_at=CASE WHEN $2='SYNCED' THEN NOW() ELSE hola_maps_last_synced_at END,
         hola_maps_published=COALESCE($4,hola_maps_published),
         hola_maps_external_spot_id=CASE
           WHEN $7::boolean THEN NULL
           WHEN $5::text IS NOT NULL THEN $5
           ELSE hola_maps_external_spot_id
         END,
         hola_maps_public_url=CASE
           WHEN $7::boolean THEN NULL
           WHEN $6::text IS NOT NULL THEN $6
           ELSE hola_maps_public_url
         END,
         updated_at=NOW()
     WHERE id=$1`,
    [
      submissionId,
      status,
      error ? String(error).slice(0, 2000) : null,
      published,
      mapMeta?.spotId || null,
      mapMeta?.publicUrl || null,
      clearMapMeta
    ]
  );
}

async function clearPendingJobs(submissionId) {
  if (!submissionId) return;
  await pool.query(`DELETE FROM hola_maps_sync_jobs WHERE submission_id=$1 AND status='PENDING'`, [submissionId]);
}

async function executeJob(job) {
  if (job.action === 'DELETE') {
    await deleteHaloPost(job.external_post_id);
    return { skipped: false, published: false, mapMeta: null };
  }

  const submission = await loadSubmissionForSync(job.submission_id);
  if (!submission) return { skipped: true, reason: 'Submission không còn tồn tại.' };
  if (!isSubmissionEligibleForHolaMaps(submission)) {
    return { skipped: true, reason: 'Bài chưa được duyệt và công bố nên không đồng bộ HOLA Maps.' };
  }
  const payload = buildHolaMapsPayload(submission, submission.media || []);
  if (!payload) return { skipped: true, reason: 'Bài chưa có ảnh hoặc chưa có vị trí có cấu trúc.' };
  const response = await syncHaloPost(payload);
  return { skipped: false, published: true, mapMeta: mapPublicMetadata(response), response };
}

async function runJob(jobId) {
  const { rows } = await pool.query('SELECT * FROM hola_maps_sync_jobs WHERE id=$1 LIMIT 1', [jobId]);
  const job = rows[0];
  if (!job || job.status === 'SYNCED') return;
  if (job.next_attempt_at && new Date(job.next_attempt_at).getTime() > Date.now() + 500) return;

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
    if (job.submission_id) await setSubmissionSyncState(job.submission_id, 'SYNCED', null, result.published, result.mapMeta);
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

export async function enqueueHolaMapsSync({ submissionId = null, externalPostId, action = 'UPSERT', nextAttemptAt = null, kick = true }) {
  if (!externalPostId) throw new Error('externalPostId is required');
  const when = nextAttemptAt ? new Date(nextAttemptAt) : new Date();
  if (Number.isNaN(when.getTime())) throw new Error('nextAttemptAt is invalid');
  const { rows } = await pool.query(
    `INSERT INTO hola_maps_sync_jobs(submission_id,external_post_id,action,status,next_attempt_at)
     VALUES($1,$2,$3,'PENDING',$4) RETURNING id`,
    [submissionId, String(externalPostId), action, when]
  );
  if (submissionId) await setSubmissionSyncState(submissionId, 'PENDING', null);
  const id = rows[0].id;
  if (kick && when.getTime() <= Date.now() + 500) kickHolaMapsSyncJob(id);
  return id;
}

export async function reconcileSubmissionHolaMaps(submissionId) {
  const submission = await loadSubmissionForSync(submissionId);
  if (!submission) return { action: 'NONE', reason: 'NOT_FOUND' };

  await clearPendingJobs(submissionId);

  const payload = buildHolaMapsPayload(submission, submission.media || []);
  if (isSubmissionEligibleForHolaMaps(submission)) {
    if (!payload) {
      if (truthy(submission.hola_maps_published)) {
        const jobId = await enqueueHolaMapsSync({ submissionId, externalPostId: submission.id, action: 'DELETE' });
        return { action: 'DELETE', jobId, reason: 'PUBLIC_BUT_NO_MAP_PAYLOAD' };
      }
      await setSubmissionSyncState(submissionId, 'PENDING', null, false);
      return { action: 'NONE', reason: 'MISSING_IMAGE_OR_LOCATION' };
    }
    const jobId = await enqueueHolaMapsSync({ submissionId, externalPostId: submission.id, action: 'UPSERT' });
    return { action: 'UPSERT', jobId };
  }

  const scheduledAt = submission.publication_state === 'SCHEDULED' && submission.publish_scheduled_at
    ? new Date(submission.publish_scheduled_at)
    : null;
  if (isBaseEligible(submission) && scheduledAt && Number.isFinite(scheduledAt.getTime()) && scheduledAt.getTime() > Date.now() && payload) {
    const jobId = await enqueueHolaMapsSync({
      submissionId,
      externalPostId: submission.id,
      action: 'UPSERT',
      nextAttemptAt: scheduledAt,
      kick: false
    });
    return { action: 'SCHEDULED_UPSERT', jobId, scheduledAt: scheduledAt.toISOString() };
  }

  if (truthy(submission.hola_maps_published)) {
    const jobId = await enqueueHolaMapsSync({ submissionId, externalPostId: submission.id, action: 'DELETE' });
    return { action: 'DELETE', jobId };
  }

  await setSubmissionSyncState(submissionId, 'PENDING', null, false);
  return { action: 'NONE', reason: 'NOT_PUBLIC' };
}

export async function queueSubmissionSync(submissionId) {
  const result = await reconcileSubmissionHolaMaps(submissionId);
  return ['UPSERT','SCHEDULED_UPSERT'].includes(result.action) ? result.jobId : null;
}

export async function queueSubmissionDelete(externalPostId, submissionId = null) {
  return enqueueHolaMapsSync({ submissionId, externalPostId, action: 'DELETE' });
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
