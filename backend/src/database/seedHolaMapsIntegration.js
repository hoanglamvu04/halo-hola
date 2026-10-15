import crypto from 'node:crypto';
import { pool } from './pool.js';
import { reconcileSubmissionHolaMaps } from '../services/holaMaps.service.js';

const TEST_CODE = 'HH26-MAPTEST01';
const TEST_EMAIL = 'map-test@xspace.vn';
const TEST_IMAGE = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=88';
const TEST_LAT = 20.99552;
const TEST_LNG = 105.52518;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForSync(submissionId, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { rows } = await pool.query(
      `SELECT hola_maps_sync_status,hola_maps_published,hola_maps_last_sync_error,hola_maps_last_synced_at
       FROM submissions WHERE id=$1 LIMIT 1`,
      [submissionId]
    );
    const state = rows[0];
    if (!state) return { status: 'DELETED' };
    if (state.hola_maps_sync_status === 'SYNCED' || state.hola_maps_sync_status === 'FAILED') return state;
    await sleep(500);
  }
  const { rows } = await pool.query(
    `SELECT hola_maps_sync_status,hola_maps_published,hola_maps_last_sync_error,hola_maps_last_synced_at
     FROM submissions WHERE id=$1 LIMIT 1`,
    [submissionId]
  );
  return rows[0] || { status: 'UNKNOWN' };
}

async function seed() {
  const client = await pool.connect();
  let submissionId;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO submissions(
         code,name,display_name,email,phone,bio,title,captured_at,
         rights_confirmed,image_consent_confirmed,is_minor,guardian_consent,
         type,theme,color,location,location_lat,location_lng,location_address,location_source,
         story,status,allow_media_use,allow_newsletter,is_demo,
         publication_state,published_at,publish_scheduled_at,
         hola_maps_sync_status,hola_maps_last_sync_error,hola_maps_published,created_at,updated_at
       ) VALUES (
         $1,'HALO HOLA Test','HALO HOLA Test',$2,'0900000000','Dữ liệu kiểm thử tích hợp HALO HOLA → HOLA Maps.',
         '[TEST] Nắng Hòa Lạc trên bản đồ',CURRENT_DATE,
         TRUE,TRUE,FALSE,FALSE,
         'Photo','Nắng Hòa Lạc','Nắng','Điểm test HALO HOLA',$3,$4,'Hòa Lạc, Hà Nội','PIN',
         'Bài kiểm thử luồng duyệt, công bố và đồng bộ một địa điểm từ HALO HOLA sang HOLA Maps.',
         'VALID',TRUE,FALSE,FALSE,
         'PUBLISHED',NOW(),NULL,
         'PENDING',NULL,FALSE,NOW(),NOW()
       )
       ON CONFLICT(code) DO UPDATE SET
         name=EXCLUDED.name,display_name=EXCLUDED.display_name,email=EXCLUDED.email,phone=EXCLUDED.phone,
         bio=EXCLUDED.bio,title=EXCLUDED.title,captured_at=EXCLUDED.captured_at,
         rights_confirmed=TRUE,image_consent_confirmed=TRUE,is_minor=FALSE,guardian_consent=FALSE,
         type=EXCLUDED.type,theme=EXCLUDED.theme,color=EXCLUDED.color,
         location=EXCLUDED.location,location_lat=EXCLUDED.location_lat,location_lng=EXCLUDED.location_lng,
         location_address=EXCLUDED.location_address,location_source='PIN',story=EXCLUDED.story,
         status='VALID',allow_media_use=TRUE,is_demo=FALSE,
         publication_state='PUBLISHED',published_at=NOW(),publish_scheduled_at=NULL,
         hola_maps_sync_status='PENDING',hola_maps_last_sync_error=NULL,updated_at=NOW()
       RETURNING id`,
      [TEST_CODE, TEST_EMAIL, TEST_LAT, TEST_LNG]
    );
    submissionId = rows[0].id;

    await client.query('DELETE FROM submission_media WHERE submission_id=$1', [submissionId]);
    await client.query(
      `INSERT INTO submission_media(
         submission_id,url,original_name,mime_type,size_bytes,storage_provider,sha256,revision
       ) VALUES($1,$2,'halo-hola-maps-test.jpg','image/jpeg',1200000,'SHOWCASE',$3,1)`,
      [
        submissionId,
        TEST_IMAGE,
        crypto.createHash('sha256').update(`${TEST_CODE}:${TEST_IMAGE}`).digest('hex')
      ]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  const reconcile = await reconcileSubmissionHolaMaps(submissionId);
  const sync = await waitForSync(submissionId);

  console.log('\nHALO HOLA → HOLA Maps integration seed complete.');
  console.log(`Code: ${TEST_CODE}`);
  console.log(`Submission ID: ${submissionId}`);
  console.log(`Location: ${TEST_LAT}, ${TEST_LNG}`);
  console.log(`Reconcile action: ${reconcile.action}`);
  console.log(`Sync status: ${sync.hola_maps_sync_status || sync.status}`);
  console.log(`Published on HOLA Maps: ${Boolean(sync.hola_maps_published)}`);
  if (sync.hola_maps_last_sync_error) console.log(`Sync error: ${sync.hola_maps_last_sync_error}`);
  console.log('Expected: bài [TEST] xuất hiện trên HOLA Maps tại pin Hòa Lạc và link nguồn trỏ về HALO HOLA.\n');
}

async function clean() {
  const { rows } = await pool.query('SELECT id FROM submissions WHERE code=$1 LIMIT 1', [TEST_CODE]);
  const item = rows[0];
  if (!item) {
    console.log(`Không có dữ liệu test ${TEST_CODE} để xóa.`);
    return;
  }

  await pool.query(
    `UPDATE submissions
     SET publication_state='HIDDEN',published_at=NULL,publish_scheduled_at=NULL,updated_at=NOW()
     WHERE id=$1`,
    [item.id]
  );

  const reconcile = await reconcileSubmissionHolaMaps(item.id);
  const sync = await waitForSync(item.id);
  if (sync.hola_maps_sync_status === 'FAILED') {
    throw new Error(`Không thể gỡ bài khỏi HOLA Maps: ${sync.hola_maps_last_sync_error || 'unknown error'}`);
  }
  if (sync.hola_maps_published) {
    throw new Error('Bài test vẫn đang được đánh dấu published trên HOLA Maps; chưa xóa DB để tránh orphan dữ liệu.');
  }

  await pool.query('DELETE FROM submissions WHERE id=$1', [item.id]);
  console.log(`Đã gỡ HOLA Maps và xóa dữ liệu test ${TEST_CODE}. Reconcile: ${reconcile.action}.`);
}

async function main() {
  const cleanMode = process.argv.includes('--clean');
  try {
    if (cleanMode) await clean();
    else await seed();
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
