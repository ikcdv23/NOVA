import 'server-only';
import { randomUUID } from 'node:crypto';
import type { PoolClient } from 'pg';
import sharp from 'sharp';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { storage } from './storage';
import * as repository from './repository/media-repository';

export class PhotoUploadError extends Error {}

export type PreparedPhoto = { bytes: Buffer };

export async function preparePhotos(entries: FormDataEntryValue[], limit = 5) {
  const files = entries.filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length > limit) throw new PhotoUploadError(`Puedes subir hasta ${limit} fotos.`);

  const prepared: PreparedPhoto[] = [];
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024)
      throw new PhotoUploadError(`“${file.name}” supera el máximo de 5 MB.`);
    try {
      const input = Buffer.from(await file.arrayBuffer());
      const metadata = await sharp(input, { limitInputPixels: 25_000_000 }).metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1) > 1)
        throw new PhotoUploadError(`“${file.name}” no es una imagen JPG, PNG o WebP válida.`);
      prepared.push({
        bytes: await sharp(input, { limitInputPixels: 25_000_000 })
          .rotate()
          .resize({ width: 1600, height: 2000, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toBuffer(),
      });
    } catch (error) {
      if (error instanceof PhotoUploadError) throw error;
      throw new PhotoUploadError(`No se ha podido leer “${file.name}”. Prueba con otra imagen.`);
    }
  }
  return prepared;
}

export async function storePreparedPhotos(
  client: PoolClient,
  productId: string,
  productName: string,
  photos: PreparedPhoto[],
  startPosition: number,
) {
  if (!photos.length) return;
  const { client: s3, bucket } = storage();
  for (const [offset, photo] of photos.entries()) {
    const id = randomUUID();
    const key = `products/${productId}/${id}.webp`;
    await repository.scheduleUploadCleanup(key);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: photo.bytes,
        ContentType: 'image/webp',
        CacheControl: 'private, max-age=300',
      }),
      { abortSignal: AbortSignal.timeout(30000) },
    );
    await repository.addImage(client, id, productId, key, productName, startPosition + offset);
  }
}
