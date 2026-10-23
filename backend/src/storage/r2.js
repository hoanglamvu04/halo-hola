import {
  S3Client,
  HeadBucketCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function createR2Client() {
  const endpoint = requireEnv('R2_ENDPOINT');
  const accessKeyId = requireEnv('R2_ACCESS_KEY_ID');
  const secretAccessKey = requireEnv('R2_SECRET_ACCESS_KEY');

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

export function getR2Buckets() {
  return {
    originals: requireEnv('R2_BUCKET_ORIGINALS'),
    public: requireEnv('R2_BUCKET_PUBLIC')
  };
}

export async function assertR2BucketAccess(client, bucket) {
  await client.send(new HeadBucketCommand({ Bucket: bucket }));
}

export async function putR2Object({ client, bucket, key, body, contentType, metadata = {} }) {
  return client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
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
