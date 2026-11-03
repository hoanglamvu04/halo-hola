import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getConnectionConfig, isConnectionConfigured } from '../services/connectionSettings.service.js';

export function hasR2Config(bucket='originals') {
  const config=getConnectionConfig('r2');
  return isConnectionConfigured('r2',config) && Boolean(bucket==='public'?config.bucketPublic:config.bucketOriginals);
}
export function createR2Client() {
  const config=getConnectionConfig('r2');
  if(!hasR2Config())throw new Error('R2 is not configured.');
  return new S3Client({
    region: 'auto',endpoint:config.endpoint,
    // R2 does not support every optional trailing-checksum mode from recent AWS SDKs.
    requestChecksumCalculation: 'WHEN_REQUIRED',
    credentials:{accessKeyId:config.accessKeyId,secretAccessKey:config.secretAccessKey}
  });
}
export function getR2Buckets() {
  const config=getConnectionConfig('r2');
  return { originals:config.bucketOriginals,public:config.bucketPublic };
}

export async function assertR2BucketAccess(client, bucket) {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
}

export async function putR2Object({ client, bucket, key, body, contentType, contentLength, metadata = {} }) {
  return client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ...(Number.isSafeInteger(contentLength) && contentLength >= 0 ? { ContentLength: contentLength } : {}),
    ContentType: contentType,
    Metadata: metadata
  }));
}

export async function deleteR2Object({ client, bucket, key }) {
  return client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function createDownloadUrl({ client, bucket, key, expiresIn = 900 }) {
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );
}
