import 'server-only';
import type { Prisma } from '@/generated/prisma-client/client';
import { prisma } from '@/lib/prisma';

type Transaction = Prisma.TransactionClient;

export async function lockProduct(tx: Transaction, id: string) {
  const rows = await tx.$queryRaw<
    { name: string }[]
  >`SELECT name FROM products WHERE id = ${id}::uuid FOR UPDATE`;
  return rows[0];
}

export async function listImages(tx: Transaction, productId: string) {
  const images = await tx.image.findMany({
    where: { productId },
    select: { id: true, objectKey: true },
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
  });
  return images.map(({ id, objectKey }) => ({ id, object_key: objectKey }));
}

export async function deleteImage(
  tx: Transaction,
  image: { id: string; object_key: string | null },
  productId: string,
  last: boolean,
) {
  if (image.object_key)
    await tx.mediaCleanup.createMany({
      data: [{ objectKey: image.object_key }],
      skipDuplicates: true,
    });
  await tx.image.deleteMany({ where: { id: image.id } });
  if (last) await tx.product.updateMany({ where: { id: productId }, data: { published: false } });
}

export async function reorderImages(tx: Transaction, ids: string[]) {
  for (const [position, id] of ids.entries())
    await tx.image.updateMany({ where: { id }, data: { position } });
}

export async function findImage(id: string) {
  const image = await prisma.image.findUnique({
    where: { id },
    select: { objectKey: true, product: { select: { published: true } } },
  });
  return image ? { object_key: image.objectKey, published: image.product.published } : undefined;
}

export async function pendingCleanup() {
  // La consulta conserva la comprobación de que ninguna imagen usa la clave.
  return prisma.$queryRaw<
    { object_key: string }[]
  >`SELECT q.object_key FROM media_cleanup q WHERE q.not_before <= now()
    AND NOT EXISTS (SELECT 1 FROM images i WHERE i.object_key = q.object_key) ORDER BY q.created_at LIMIT 100`;
}

export async function removeCleanup(key: string) {
  await prisma.mediaCleanup.deleteMany({ where: { objectKey: key } });
}

export async function scheduleUploadCleanup(key: string) {
  await prisma.mediaCleanup.createMany({
    data: [{ objectKey: key, notBefore: new Date(Date.now() + 60 * 60 * 1000) }],
    skipDuplicates: true,
  });
}

export async function addImage(
  tx: Transaction,
  id: string,
  productId: string,
  key: string,
  name: string,
  position: number,
) {
  await tx.image.create({ data: { id, productId, objectKey: key, alt: name, position } });
  await tx.mediaCleanup.deleteMany({ where: { objectKey: key } });
}
