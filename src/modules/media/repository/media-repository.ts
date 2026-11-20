import 'server-only';
import type { PoolClient } from 'pg';
import { db } from '@/lib/db';

export async function lockProduct(client: PoolClient, id: string) {
  const { rows } = await client.query<{ name: string }>(
    'SELECT name FROM products WHERE id=$1 FOR UPDATE',
    [id],
  );
  return rows[0];
}

export async function listImages(client: PoolClient, productId: string) {
  const { rows } = await client.query<{ id: string; object_key: string | null }>(
    'SELECT id,object_key FROM images WHERE product_id=$1 ORDER BY position,id',
    [productId],
  );
  return rows;
}

export async function deleteImage(
  client: PoolClient,
  image: { id: string; object_key: string | null },
  productId: string,
  last: boolean,
) {
  if (image.object_key)
    await client.query('INSERT INTO media_cleanup(object_key) VALUES($1) ON CONFLICT DO NOTHING', [
      image.object_key,
    ]);
  await client.query('DELETE FROM images WHERE id=$1', [image.id]);
  if (last) await client.query('UPDATE products SET published=false WHERE id=$1', [productId]);
}

export async function reorderImages(client: PoolClient, ids: string[]) {
  for (const [position, id] of ids.entries())
    await client.query('UPDATE images SET position=$2 WHERE id=$1', [id, position]);
}

export async function findImage(id: string) {
  const { rows } = await db.query<{ object_key: string | null; published: boolean }>(
    'SELECT i.object_key,p.published FROM images i JOIN products p ON p.id=i.product_id WHERE i.id=$1',
    [id],
  );
  return rows[0];
}

export async function pendingCleanup() {
  const { rows } = await db.query<{
    object_key: string;
  }>(`SELECT q.object_key FROM media_cleanup q WHERE q.not_before<=now()
    AND NOT EXISTS (SELECT 1 FROM images i WHERE i.object_key=q.object_key) ORDER BY q.created_at LIMIT 100`);
  return rows;
}

export async function removeCleanup(key: string) {
  await db.query('DELETE FROM media_cleanup WHERE object_key=$1', [key]);
}

export async function scheduleUploadCleanup(key: string) {
  await db.query(
    "INSERT INTO media_cleanup(object_key,not_before) VALUES($1,now()+interval '1 hour') ON CONFLICT DO NOTHING",
    [key],
  );
}

export async function addImage(
  client: PoolClient,
  id: string,
  productId: string,
  key: string,
  name: string,
  position: number,
) {
  await client.query(
    'INSERT INTO images(id,product_id,object_key,alt,position) VALUES($1,$2,$3,$4,$5)',
    [id, productId, key, name, position],
  );
  await client.query('DELETE FROM media_cleanup WHERE object_key=$1', [key]);
}
