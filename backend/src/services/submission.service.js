import crypto from 'node:crypto';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import { pool, withTransaction } from '../database/pool.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { kickHolaMapsSyncJob } from './holaMaps.service.js';
import {
  createR2Client,
  getR2Buckets,
  putR2Object,
  createDownloadUrl
} from '../storage/r2.js';

function truthy(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return String(value).toLowerCase() === 'true';
}

async function generateCode(client) {
  for (let i = 0; i < 12; i += 1) {
    const code = 'HH26-' + crypto.randomInt(1, 99999).toString().padStart(5, '0');
    const { rowCount } = await client.query('SELECT 1 FROM submissions WHERE code = $1', [code]);
    if (!rowCount) return code;
  }
  return 'HH26-' + Date.now().toString().slice(-5);
}

function safeFilename(name = 'file') {
  const ext = path.extname(name).toLowerCase().replace(/[^.a-z0-9]/g, '');
  const base = path.basename(name, path.extname(name))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'file';
  return base + ext;
}

async function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  await new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', resolve);
    stream.on('error', reject);
  });
  return hash.digest('hex');
}

function hasR2Config() {
  return Boolean(
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_ORIGINALS
  );
}

async function storeOriginalFiles(client, submission, files = []) {
  const media = [];
  if (!files.length) return media;

  const useR2 = hasR2Config();
  if (env.nodeEnv === 'production' && !useR2) {
    throw new AppError('Kho lưu file gốc tạm thời chưa sẵn sàng. Vui lòng thử lại sau.', 503);
  }

  const r2 = useR2 ? createR2Client() : null;
  const buckets = useR2 ? getR2Buckets() : null;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const sha256 = await sha256File(file.path);
    const filename = String(index + 1).padStart(2, '0') + '_' + safeFilename(file.originalname);
    const objectKey = `2026/submissions/${submission.code}/original/v1/${filename}`;

    let storageProvider = 'LOCAL';
    let bucket = null;
    let storedUrl = '/uploads/' + file.filename;

    if (useR2) {
      await putR2Object({
        client: r2,
        bucket: buckets.originals,
        key: objectKey,
        body: fs.createReadStream(file.path),
        contentType: file.mimetype,
        metadata: {
          submission: submission.code,
          sha256,
          originalname: encodeURIComponent(file.originalname)
        }
      });
      storageProvider = 'R2';
      bucket = buckets.originals;
      storedUrl = `r2://${bucket}/${objectKey}`;
      await fsPromises.unlink(file.path).catch(() => {});
    }

    const inserted = await client.query(
      `INSERT INTO submission_media
       (submission_id,url,original_name,mime_type,size_bytes,storage_provider,bucket,object_key,sha256,revision)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,1)
       RETURNING *`,
      [
        submission.id,
        storedUrl,
        file.originalname,
        file.mimetype,
        file.size,
        storageProvider,
        bucket,
        useR2 ? objectKey : null,
        sha256
      ]
    );
    media.push(inserted.rows[0]);
  }

  return media;
}

export async function createSubmission(data, files = []) {
  return withTransaction(async (client) => {
    const code = await generateCode(client);
    const result = await client.query(
      `INSERT INTO submissions
       (code,name,display_name,email,phone,bio,title,captured_at,external_link,previous_award,previous_award_note,
        rights_confirmed,image_consent_confirmed,is_minor,guardian_name,guardian_consent,
        type,theme,color,location,hola_map_place_id,hola_map_place_slug,location_lat,location_lng,location_address,location_source,
        story,allow_media_use,allow_newsletter)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
       RETURNING *`,
      [
        code,
        data.name,
        data.displayName || null,
        data.email.toLowerCase(),
        data.phone || null,
        data.bio || null,
        data.title,
        data.capturedAt || null,
        data.externalLink || null,
        truthy(data.previousAward),
        data.previousAwardNote || null,
        truthy(data.rightsConfirmed),
        truthy(data.imageConsentConfirmed),
        truthy(data.isMinor),
        data.guardianName || null,
        truthy(data.guardianConsent),
        data.type,
        data.theme,
        data.color || null,
        data.location,
        data.locationPlaceId || null,
        data.locationPlaceSlug || null,
        data.locationLat ?? null,
        data.locationLng ?? null,
        data.locationAddress || null,
        data.locationSource || 'TEXT',
        data.story,
        truthy(data.allowMediaUse, true),
        truthy(data.allowNewsletter, false)
      ]
    );

    const submission = result.rows[0];
    const media = await storeOriginalFiles(client, submission, files);
    return { ...submission, media };
  });
}

export async function lookupSubmission(code, email) {
  const { rows } = await pool.query(
    `SELECT s.id,s.code,s.title,s.type,s.theme,s.color,s.location,
       s.hola_map_place_id,s.hola_map_place_slug,s.location_lat,s.location_lng,s.location_address,s.location_source,
       s.status,s.hola_maps_sync_status,s.hola_maps_last_sync_error,s.hola_maps_last_synced_at,s.created_at,s.updated_at,
       COUNT(m.id)::int AS media_count,
       COALESCE(SUM(m.size_bytes),0)::bigint AS total_bytes
     FROM submissions s
     LEFT JOIN submission_media m ON m.submission_id = s.id
     WHERE UPPER(s.code) = UPPER($1) AND LOWER(s.email) = LOWER($2)
     GROUP BY s.id`,
    [code, email]
  );
  return rows[0] || null;
}

export async function getPublicStats() {
  const { rows } = await pool.query(
    `SELECT
      COUNT(*)::int AS submissions,
      COUNT(DISTINCT email)::int AS creators,
      COUNT(DISTINCT NULLIF(location,''))::int AS locations,
      COUNT(*) FILTER (WHERE status IN ('TOP52','AWARDED'))::int AS top52
     FROM submissions
     WHERE is_demo = FALSE`
  );
  return rows[0] || { submissions: 0, creators: 0, locations: 0, top52: 0 };
}

export async function listSubmissions({ status, q } = {}) {
  const values = [];
  const conditions = [];

  if (status) {
    values.push(status);
    conditions.push(`s.status = $${values.length}`);
  }

  if (q) {
    values.push('%' + q.trim() + '%');
    conditions.push(`(
      s.code ILIKE $${values.length} OR
      s.title ILIKE $${values.length} OR
      s.name ILIKE $${values.length} OR
      s.email ILIKE $${values.length}
    )`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const { rows } = await pool.query(
    `SELECT s.*,
       COALESCE(
         json_agg(
           json_build_object(
             'id', m.id,
             'url', m.url,
             'originalName', m.original_name,
             'mimeType', m.mime_type,
             'size', m.size_bytes,
             'provider', m.storage_provider,
             'bucket', m.bucket,
             'objectKey', m.object_key,
             'sha256', m.sha256,
             'revision', m.revision
           ) ORDER BY m.created_at ASC
         ) FILTER (WHERE m.id IS NOT NULL),
         '[]'::json
       ) AS media
     FROM submissions s
     LEFT JOIN submission_media m ON m.submission_id = s.id
     ${where}
     GROUP BY s.id
     ORDER BY s.created_at DESC`,
    values
  );

  return rows;
}

export async function updateSubmissionStatus(id, status) {
  const { rows } = await pool.query(
    `UPDATE submissions
     SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status]
  );
  return rows[0] || null;
}

export async function updateJuryNote(id, note) {
  const { rows } = await pool.query(
    `UPDATE submissions SET jury_note = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, note]
  );
  return rows[0] || null;
}

export async function updateSubmissionContent(id, input = {}) {
  const { rows: currentRows } = await pool.query('SELECT * FROM submissions WHERE id=$1 LIMIT 1', [id]);
  const current = currentRows[0];
  if (!current) return null;
  const value = (key, currentKey = key) => Object.prototype.hasOwnProperty.call(input, key) ? input[key] : current[currentKey];
  const { rows } = await pool.query(
    `UPDATE submissions SET
       title=$2, story=$3, location=$4, hola_map_place_id=$5, hola_map_place_slug=$6,
       location_lat=$7, location_lng=$8, location_address=$9, location_source=$10,
       hola_maps_sync_status='PENDING', hola_maps_last_sync_error=NULL, updated_at=NOW()
     WHERE id=$1 RETURNING *`,
    [
      id,
      value('title'),
      value('story'),
      value('location'),
      value('locationPlaceId', 'hola_map_place_id') || null,
      value('locationPlaceSlug', 'hola_map_place_slug') || null,
      value('locationLat', 'location_lat') === '' ? null : value('locationLat', 'location_lat'),
      value('locationLng', 'location_lng') === '' ? null : value('locationLng', 'location_lng'),
      value('locationAddress', 'location_address') || null,
      value('locationSource', 'location_source') || 'TEXT'
    ]
  );
  return rows[0] || null;
}

export async function replaceSubmissionFiles(id, files = []) {
  return withTransaction(async (client) => {
    const { rows } = await client.query('SELECT * FROM submissions WHERE id=$1 FOR UPDATE', [id]);
    const submission = rows[0];
    if (!submission) return null;
    await client.query('DELETE FROM submission_media WHERE submission_id=$1', [id]);
    const media = await storeOriginalFiles(client, submission, files);
    await client.query(
      `UPDATE submissions SET hola_maps_sync_status='PENDING',hola_maps_last_sync_error=NULL,updated_at=NOW() WHERE id=$1`,
      [id]
    );
    return { ...submission, media };
  });
}

export async function deleteSubmission(id) {
  const client = await pool.connect();
  let jobId = null;
  let deleted = null;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT id,code FROM submissions WHERE id=$1 FOR UPDATE', [id]);
    if (!rows[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    deleted = rows[0];
    const job = await client.query(
      `INSERT INTO hola_maps_sync_jobs(submission_id,external_post_id,action,status,next_attempt_at)
       VALUES(NULL,$1,'DELETE','PENDING',NOW()) RETURNING id`,
      [String(deleted.id)]
    );
    jobId = job.rows[0].id;
    await client.query('DELETE FROM submissions WHERE id=$1', [id]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  kickHolaMapsSyncJob(jobId);
  return { ...deleted, holaMapsJobId: jobId };
}

export async function getMediaDownloadUrl(mediaId) {
  const { rows } = await pool.query(
    `SELECT id,url,original_name,storage_provider,bucket,object_key
     FROM submission_media WHERE id = $1`,
    [mediaId]
  );
  const media = rows[0];
  if (!media) return null;

  if (media.storage_provider === 'R2' && media.bucket && media.object_key) {
    return {
      filename: media.original_name,
      url: await createDownloadUrl({
        client: createR2Client(),
        bucket: media.bucket,
        key: media.object_key,
        expiresIn: 900
      })
    };
  }

  const base = (process.env.PUBLIC_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');
  return { filename: media.original_name, url: media.url?.startsWith('/') ? base + media.url : media.url };
}

export async function getHaloPublicMediaUrl(mediaId) {
  const { rows } = await pool.query(
    `SELECT m.id,m.url,m.original_name,m.mime_type,m.storage_provider,m.bucket,m.object_key,
            s.allow_media_use,s.hola_map_place_id,s.location_lat,s.location_lng
     FROM submission_media m
     JOIN submissions s ON s.id=m.submission_id
     WHERE m.id=$1 LIMIT 1`,
    [mediaId]
  );
  const media = rows[0];
  if (!media || !media.allow_media_use || !String(media.mime_type || '').toLowerCase().startsWith('image/')) return null;
  const hasPlace = Boolean(media.hola_map_place_id);
  const hasCoords = Number.isFinite(Number(media.location_lat)) && Number.isFinite(Number(media.location_lng));
  if (!hasPlace && !hasCoords) return null;

  if (media.storage_provider === 'R2' && media.bucket && media.object_key) {
    return {
      filename: media.original_name,
      url: await createDownloadUrl({
        client: createR2Client(),
        bucket: media.bucket,
        key: media.object_key,
        expiresIn: 300
      })
    };
  }
  const base = env.publicBaseUrl.replace(/\/$/, '');
  return { filename: media.original_name, url: media.url?.startsWith('/') ? base + media.url : media.url };
}
