import 'server-only';
import type { z } from 'zod';
import type { Prisma } from '@/generated/prisma-client/client';
import type { productSchema } from '../validation';

type ProductInput = z.output<typeof productSchema>;
type Transaction = Prisma.TransactionClient;

// El bloqueo protege las comprobaciones y los cambios hasta terminar la transacción.
export async function lockProduct(tx: Transaction, id: string) {
  const rows = await tx.$queryRaw<
    { id: string }[]
  >`SELECT id FROM products WHERE id = ${id}::uuid FOR UPDATE`;
  return rows.length;
}

export function countImages(tx: Transaction, id: string) {
  return tx.image.count({ where: { productId: id } });
}

export async function slugExists(tx: Transaction, slug: string, id: string) {
  return (await tx.product.count({ where: { slug, id: { not: id } } })) > 0;
}

export async function saveProduct(
  tx: Transaction,
  id: string,
  product: ProductInput,
  slug: string,
  editing: boolean,
) {
  const data = {
    name: product.name,
    slug,
    collection: product.collection,
    category: product.category,
    priceCents: product.price,
    measurements: product.measurements,
    description: product.description,
    condition: product.condition,
    published: product.published,
    featured: product.featured,
  };
  if (editing) {
    await tx.product.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
      select: { id: true },
    });
  } else {
    await tx.product.create({ data: { id, ...data }, select: { id: true } });
  }

  // Conservamos la estrategia anterior: reemplazar todas las variantes.
  await tx.variant.deleteMany({ where: { productId: id } });
  await tx.variant.createMany({
    data: product.variants.map((variant, position) => ({
      productId: id,
      size: variant.size,
      stock: variant.stock,
      position,
    })),
  });
}

export async function setVisibility(tx: Transaction, id: string, published: boolean) {
  await tx.product.updateMany({ where: { id }, data: { published, updatedAt: new Date() } });
}

export async function deleteProduct(tx: Transaction, id: string) {
  const images = await tx.image.findMany({
    where: { productId: id, objectKey: { not: null } },
    select: { objectKey: true },
  });
  const keys = images.flatMap(({ objectKey }) => (objectKey === null ? [] : [{ objectKey }]));
  if (keys.length) await tx.mediaCleanup.createMany({ data: keys, skipDuplicates: true });
  await tx.product.deleteMany({ where: { id } });
}
