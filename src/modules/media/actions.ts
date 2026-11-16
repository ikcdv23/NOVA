'use server';
import { revalidatePath } from 'next/cache';
import { transaction } from '@/lib/db';
import { requireAdmin } from '@/modules/auth/session';
import { idSchema, type ActionState } from '@/modules/admin/validation';
import { cleanupMedia } from './storage';
import { PhotoUploadError, preparePhotos, storePreparedPhotos } from './upload';
export async function uploadPhoto(
  productId: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  if (!idSchema.safeParse(productId).success) return { error: 'Prenda no válida.' };
  try {
    const entry = form.get('photo');
    const photos = await preparePhotos(entry === null ? [] : [entry], 1);
    if (!photos.length) return { error: 'Elige una imagen JPG, PNG o WebP de hasta 5 MB.' };
    await transaction(async (c) => {
      const { rows } = await c.query<{ name: string }>(
        'SELECT name FROM products WHERE id=$1 FOR UPDATE',
        [productId],
      );
      if (!rows[0]) throw new Error('Prenda no encontrada.');
      const { rows: images } = await c.query('SELECT id FROM images WHERE product_id=$1', [
        productId,
      ]);
      if (images.length >= 5) throw new Error('Cada prenda admite hasta 5 fotos.');
      await storePreparedPhotos(c, productId, rows[0].name, photos, images.length);
    });
  } catch (error) {
    return {
      error:
        error instanceof PhotoUploadError
          ? error.message
          : error instanceof Error &&
              [
                'Prenda no encontrada.',
                'Cada prenda admite hasta 5 fotos.',
                'Configura el almacenamiento S3.',
              ].includes(error.message)
            ? error.message
            : 'No se ha podido subir la imagen. Comprueba el archivo y la conexión con S3.',
    };
  }
  revalidatePath('/', 'layout');
  return { success: 'Foto añadida.' };
}
export async function changePhoto(
  productId: string,
  imageId: string,
  operation: 'primary' | 'delete',
): Promise<ActionState> {
  await requireAdmin();
  if (
    !idSchema.safeParse(productId).success ||
    !idSchema.safeParse(imageId).success ||
    !['primary', 'delete'].includes(operation)
  )
    return { error: 'Solicitud no válida.' };
  try {
    await transaction(async (c) => {
      await c.query('SELECT id FROM products WHERE id=$1 FOR UPDATE', [productId]);
      const { rows } = await c.query<{ id: string; object_key: string | null }>(
        'SELECT id,object_key FROM images WHERE product_id=$1 ORDER BY position,id',
        [productId],
      );
      const image = rows.find((i) => i.id === imageId);
      if (!image) throw new Error('MISSING');
      if (operation === 'delete') {
        if (image.object_key)
          await c.query('INSERT INTO media_cleanup(object_key) VALUES($1) ON CONFLICT DO NOTHING', [
            image.object_key,
          ]);
        await c.query('DELETE FROM images WHERE id=$1', [imageId]);
        if (rows.length === 1)
          await c.query('UPDATE products SET published=false WHERE id=$1', [productId]);
      }
      const ordered =
        operation === 'primary'
          ? [image, ...rows.filter((i) => i.id !== imageId)]
          : rows.filter((i) => i.id !== imageId);
      for (const [position, i] of ordered.entries())
        await c.query('UPDATE images SET position=$2 WHERE id=$1', [i.id, position]);
    });
  } catch {
    return { error: 'No se ha podido cambiar la imagen.' };
  }
  revalidatePath('/', 'layout');
  return {
    success:
      operation === 'primary'
        ? 'Imagen principal actualizada.'
        : 'Imagen borrada. Si era la última, la prenda se ha ocultado.',
  };
}
export async function runCleanup(): Promise<ActionState> {
  await requireAdmin();
  try {
    const count = await cleanupMedia();
    return { success: `Se han retirado ${count} archivos pendientes del bucket.` };
  } catch {
    return { error: 'La limpieza sigue pendiente. Comprueba las credenciales S3 y reintenta.' };
  }
}
