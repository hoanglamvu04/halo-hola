import 'dotenv/config';
import {
  createR2Client,
  getR2Buckets,
  assertR2BucketAccess,
  putR2Object,
  deleteR2Object
} from './r2.js';

const client = createR2Client();
const buckets = getR2Buckets();

const testKey = `_healthcheck/${Date.now()}.txt`;
const body = Buffer.from('HALO HOLA R2 OK', 'utf8');

try {
  console.log('Checking R2 buckets...');

  await assertR2BucketAccess(client, buckets.originals);
  console.log(`✓ Access OK: ${buckets.originals}`);

  await assertR2BucketAccess(client, buckets.public);
  console.log(`✓ Access OK: ${buckets.public}`);

  await putR2Object({
    client,
    bucket: buckets.originals,
    key: testKey,
    body,
    contentType: 'text/plain',
    metadata: { purpose: 'halo-hola-r2-healthcheck' }
  });
  console.log(`✓ Upload OK: ${buckets.originals}/${testKey}`);

  await deleteR2Object({
    client,
    bucket: buckets.originals,
    key: testKey
  });
  console.log('✓ Delete test object OK');

  console.log('\nR2 connection is ready for HALO HOLA.');
} catch (error) {
  console.error('\nR2 test failed.');
  console.error(error?.name || 'Error', '-', error?.message || error);
  process.exitCode = 1;
}
