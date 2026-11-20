'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/session';
import * as service from '../service/admin-service';
import { PhotoUploadError, preparePhotos } from '@/modules/media/upload';
import { idSchema, productSchema, slugifyProductName, type ActionState } from '../validation';
export async function saveProduct(
  id: string | null,
  _state: ActionState,
  form: FormData,
): Promise<ActionState> {
  await requireAdmin();
  if (id && !idSchema.safeParse(id).success) return { error: 'Prenda no válida.' };
  let variants: unknown;
  try {
    variants = JSON.parse(String(form.get('variants') ?? '[]'));
  } catch {
    return { error: 'Revisa las tallas y el stock.' };
  }
  const raw = Object.fromEntries(form);
  const parsed = productSchema.safeParse({
    ...raw,
    slug: String(raw.slug ?? '').trim() || slugifyProductName(String(raw.name ?? '')),
    variants,
    published: form.get('published') === 'on',
    featured: form.get('featured') === 'on',
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? 'form');
      (fieldErrors[field] ??= []).push(issue.message);
    }
    return {
      error: 'Hay campos que necesitan tu atención. Están marcados más abajo.',
      fieldErrors,
    };
  }
  let photos;
  try {
    photos = await preparePhotos(form.getAll('photos'));
  } catch (error) {
    return {
      error: 'Revisa las fotografías seleccionadas.',
      fieldErrors: {
        photos: [
          error instanceof PhotoUploadError
            ? error.message
            : 'No se han podido leer las fotografías.',
        ],
      },
    };
  }
  let productId: string;
  try {
    productId = await service.saveProduct(id, parsed.data, photos);
  } catch (error) {
    if (error instanceof Error && error.message === 'PHOTO')
      return {
        error: 'Falta una fotografía para poder publicar.',
        fieldErrors: { photos: ['Selecciona al menos una fotografía o guarda sin publicar.'] },
      };
    if (error instanceof PhotoUploadError)
      return { error: 'Revisa las fotografías.', fieldErrors: { photos: [error.message] } };
    if (error instanceof Error && error.message === 'Configura el almacenamiento S3.')
      return {
        error: 'No se han podido guardar las fotografías.',
        fieldErrors: { photos: ['El almacenamiento de imágenes no está configurado.'] },
      };
    if (error instanceof Error && error.message === 'SLUG')
      return {
        error: 'La dirección web ya pertenece a otra prenda.',
        fieldErrors: { slug: ['Prueba una dirección diferente.'] },
      };
    if (error instanceof Error && 'code' in error && error.code === '23505')
      return {
        error: 'La dirección web ya pertenece a otra prenda.',
        fieldErrors: { slug: ['Prueba una dirección diferente.'] },
      };
    return { error: 'No se ha podido guardar la prenda. Recarga y vuelve a intentarlo.' };
  }
  revalidatePath('/', 'layout');
  if (!id) redirect(`/admin/prendas/${productId}`);
  return { success: 'Prenda guardada. El catálogo ya está actualizado.' };
}
export async function setVisibility(id: string, published: boolean): Promise<ActionState> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success || typeof published !== 'boolean')
    return { error: 'Solicitud no válida.' };
  try {
    await service.setVisibility(id, published);
  } catch {
    return { error: 'Para publicar, la prenda debe tener al menos una foto.' };
  }
  revalidatePath('/', 'layout');
  return { success: published ? 'Prenda publicada.' : 'Prenda oculta.' };
}
export async function deleteProduct(id: string): Promise<ActionState> {
  await requireAdmin();
  if (!idSchema.safeParse(id).success) return { error: 'Prenda no válida.' };
  try {
    await service.deleteProduct(id);
  } catch {
    return { error: 'No se ha podido eliminar la prenda.' };
  }
  revalidatePath('/', 'layout');
  return { success: 'Prenda eliminada.' };
}
