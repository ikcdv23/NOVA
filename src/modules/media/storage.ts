import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { pendingCleanup, removeCleanup } from './repository/media-repository';
export function storage() {
  const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET } = process.env;
  if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY)
    throw new Error('Configura el almacenamiento S3.');
  return {
    bucket: S3_BUCKET,
    client: new S3Client({
      endpoint: S3_ENDPOINT || undefined,
      region: S3_REGION || 'us-east-1',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
    }),
  };
}
export async function cleanupMedia() {
  const rows = await pendingCleanup();
  if (!rows.length) return 0;
  const { client, bucket } = storage();
  let count = 0;
  for (const row of rows) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: row.object_key }));
    await removeCleanup(row.object_key);
    count++;
  }
  return count;
}
