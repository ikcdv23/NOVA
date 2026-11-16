import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from '@/lib/db';
import { currentAdmin } from '@/modules/auth/session';
import { idSchema } from '@/modules/admin/validation';
import { storage } from '@/modules/media/storage';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) return new Response('Not found', { status: 404 });
  const { rows } = await db.query<{ object_key: string | null; published: boolean }>(
    'SELECT i.object_key,p.published FROM images i JOIN products p ON p.id=i.product_id WHERE i.id=$1',
    [id],
  );
  const photo = rows[0];
  if (!photo?.object_key || (!photo.published && !(await currentAdmin())))
    return new Response('Not found', { status: 404 });
  const { client, bucket } = storage();
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: photo.object_key }),
    { expiresIn: 300 },
  );
  return new Response(null, {
    status: 307,
    headers: { Location: url, 'Cache-Control': 'private, no-store' },
  });
}
