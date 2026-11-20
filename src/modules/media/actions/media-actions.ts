'use server';
import { revalidatePath } from 'next/cache';
import * as service from '../service/media-service';
import { requireAdmin } from '@/modules/auth/session';
import { idSchema, type ActionState } from '@/modules/admin/validation';
import { PhotoUploadError } from '../upload';
export async function uploadPhoto(
  productId: string,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  if (!idSchema.safeParse(productId).success) return { error: 'Prenda no válida.' };
  try {
    await service.uploadPhoto(productId, form.get('photo'));
  } catch (error) {
    return {
      error:
        error instanceof PhotoUploadError
          ? error.message
          : error instanceof Error &&
              [
                'Elige una imagen JPG, PNG o WebP de hasta 5 MB.',
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
    await service.changePhoto(productId, imageId, operation);
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
    const count = await service.runCleanup();
    return { success: `Se han retirado ${count} archivos pendientes del bucket.` };
  } catch {
    return { error: 'La limpieza sigue pendiente. Comprueba las credenciales S3 y reintenta.' };
  }
}
