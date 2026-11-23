import 'server-only';
import { randomUUID } from 'node:crypto';
import type { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { PhotoUploadError, storePreparedPhotos, type PreparedPhoto } from '@/modules/media/upload';
import type { productSchema } from '../validation';
import * as repository from '../repository/admin-repository';

export async function saveProduct(
  id: string | null,
  product: z.output<typeof productSchema>,
  photos: PreparedPhoto[],
) {
  const productId = id ?? randomUUID();

  await prisma.$transaction(
    async (db) => {
      if (id && !(await repository.lockProduct(db, id))) throw new Error('MISSING');

      const imageCount = await repository.countImages(db, productId);

      if (imageCount + photos.length > 5) throw new PhotoUploadError('Máximo 5 fotos.');

      if (product.published && imageCount + photos.length === 0) throw new Error('PHOTO');

      let slug = product.slug;

      if (await repository.slugExists(db, slug, productId)) {
        if (id) throw new Error('SLUG');

        let suffix = 2;

        while (await repository.slugExists(db, `${product.slug}-${suffix}`, productId)) suffix++;
        slug = `${product.slug}-${suffix}`;
      }

      await repository.saveProduct(db, productId, product, slug, Boolean(id));

      await storePreparedPhotos(db, productId, product.name, photos, imageCount);
    },
    { timeout: 180_000 },
  );

  return productId;
}

export async function setVisibility(id: string, published: boolean) {
  await prisma.$transaction(async (db) => {
    await repository.lockProduct(db, id);
    if (published && !(await repository.countImages(db, id))) throw new Error('PHOTO');
    await repository.setVisibility(db, id, published);
  });
}

export async function deleteProduct(id: string) {
  await prisma.$transaction(async (db) => {
    await repository.lockProduct(db, id);
    await repository.deleteProduct(db, id);
  });
}
