import 'server-only';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma-client/client';
import type { Product } from '../types';

// Seleccionamos solo lo que necesita el catálogo y ordenamos sus relaciones.
const select = {
  id: true,
  name: true,
  slug: true,
  collection: true,
  category: true,
  priceCents: true,
  description: true,
  condition: true,
  measurements: true,
  published: true,
  featured: true,
  variants: { select: { size: true, stock: true }, orderBy: { position: 'asc' } },
  images: {
    select: { id: true, sampleUrl: true, alt: true, position: true },
    orderBy: [{ position: 'asc' }, { id: 'asc' }],
  },
} satisfies Prisma.ProductSelect;

type CatalogRow = NonNullable<Awaited<ReturnType<typeof findRow>>>;
function findRow(id: string) {
  return prisma.product.findUnique({ where: { id }, select });
}

function toProduct(row: CatalogRow): Product {
  return {
    ...row,
    collection: row.collection as Product['collection'],
    images: row.images.map(({ sampleUrl, ...image }) => ({
      ...image,
      url: sampleUrl ?? `/media/${image.id}`,
    })),
  };
}

export async function findPublishedProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select,
  });
  return rows.map(toProduct);
}
export async function findAdminProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, select });
  return rows.map(toProduct);
}
export async function findAdminProduct(id: string): Promise<Product | undefined> {
  const row = await findRow(id);
  return row ? toProduct(row) : undefined;
}
