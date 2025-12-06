import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../lib/s3';
import { env } from './env';

if (!env.S3_BUCKET) {
  // do not throw at import time — only operations will require it, but warn
  console.warn('S3_BUCKET is not set. Uploads will fail until configured.');
}

export async function uploadBufferToS3(buffer: Buffer, key: string, contentType?: string): Promise<string> {
  if (!env.S3_BUCKET) throw new Error('S3_BUCKET not configured');

  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const url = `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
  return url;
}

export async function deleteFromS3(key: string): Promise<void> {
  if (!env.S3_BUCKET) throw new Error('S3_BUCKET not configured');

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
    })
  );
}
