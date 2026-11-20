import 'server-only';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { transaction } from '@/lib/db';
import { currentAdmin } from '@/modules/auth/session';
import { preparePhotos, storePreparedPhotos } from '../upload';
import { cleanupMedia, storage } from '../storage';
import * as repository from '../repository/media-repository';

export async function runCleanup() {
  return cleanupMedia();
}

export async function uploadPhoto(productId: string, entry: FormDataEntryValue | null) {
  const photos = await preparePhotos(entry === null ? [] : [entry], 1);
  if (!photos.length) throw new Error('Elige una imagen JPG, PNG o WebP de hasta 5 MB.');
  await transaction(async (db) => {
    const product = await repository.lockProduct(db, productId);
    if (!product) throw new Error('Prenda no encontrada.');
    const images = await repository.listImages(db, productId);
    if (images.length >= 5) throw new Error('Cada prenda admite hasta 5 fotos.');
    await storePreparedPhotos(db, productId, product.name, photos, images.length);
  });
}

export async function changePhoto(
  productId: string,
  imageId: string,
  operation: 'primary' | 'delete',
) {
  await transaction(async (db) => {
    await repository.lockProduct(db, productId);
    const images = await repository.listImages(db, productId);
    const image = images.find((item) => item.id === imageId);
    if (!image) throw new Error('MISSING');
    if (operation === 'delete')
      await repository.deleteImage(db, image, productId, images.length === 1);
    const others = images.filter((item) => item.id !== imageId);
    const ordered = operation === 'primary' ? [image, ...others] : others;
    await repository.reorderImages(
      db,
      ordered.map((item) => item.id),
    );
  });
}

export async function signedImageUrl(id: string) {
  const photo = await repository.findImage(id);
  if (!photo?.object_key || (!photo.published && !(await currentAdmin()))) return null;
  const { client, bucket } = storage();
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: photo.object_key }), {
    expiresIn: 300,
  });
}
