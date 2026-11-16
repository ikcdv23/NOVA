'use server';
import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/session';
import { transaction } from '@/lib/db';
import { PhotoUploadError, preparePhotos, storePreparedPhotos } from '@/modules/media/upload';
import { idSchema, productSchema, slugifyProductName, type ActionState } from './validation';
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
  const p = parsed.data,
    productId = id ?? randomUUID();
  try {
    await transaction(async (c) => {
      if (id) {
        const locked = await c.query('SELECT id FROM products WHERE id=$1 FOR UPDATE', [id]);
        if (!locked.rowCount) throw new Error('MISSING');
      }
      const existingImages = (
        await c.query('SELECT id FROM images WHERE product_id=$1 ORDER BY position,id', [productId])
      ).rows;
      if (existingImages.length + photos.length > 5) throw new PhotoUploadError('Máximo 5 fotos.');
      if (p.published && existingImages.length + photos.length === 0) throw new Error('PHOTO');
      let finalSlug = p.slug;
      const slugConflict = await c.query('SELECT id FROM products WHERE slug=$1 AND id<>$2', [
        finalSlug,
        productId,
      ]);
      if (slugConflict.rowCount) {
        if (id) throw new Error('SLUG');
        let suffix = 2;
        while (
          (await c.query('SELECT 1 FROM products WHERE slug=$1', [`${p.slug}-${suffix}`])).rowCount
        )
          suffix += 1;
        finalSlug = `${p.slug}-${suffix}`;
      }
      const values = [
        productId,
        p.name,
        finalSlug,
        p.collection,
        p.category,
        p.price,
        p.measurements,
        p.description,
        p.condition,
        p.published,
        p.featured,
      ];
      if (id)
        await c.query(
          `UPDATE products SET name=$2,slug=$3,collection=$4,category=$5,price_cents=$6,measurements=$7,description=$8,condition=$9,published=$10,featured=$11,updated_at=now() WHERE id=$1`,
          values,
        );
      else
        await c.query(
          `INSERT INTO products(id,name,slug,collection,category,price_cents,measurements,description,condition,published,featured) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
          values,
        );
      await c.query('DELETE FROM variants WHERE product_id=$1', [productId]);
      for (const [i, v] of p.variants.entries())
        await c.query('INSERT INTO variants(product_id,size,stock,position) VALUES($1,$2,$3,$4)', [
          productId,
          v.size,
          v.stock,
          i,
        ]);
      await storePreparedPhotos(c, productId, p.name, photos, existingImages.length);
    });
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
    await transaction(async (c) => {
      await c.query('SELECT id FROM products WHERE id=$1 FOR UPDATE', [id]);
      if (published && !(await c.query('SELECT 1 FROM images WHERE product_id=$1', [id])).rowCount)
        throw new Error('PHOTO');
      await c.query('UPDATE products SET published=$2,updated_at=now() WHERE id=$1', [
        id,
        published,
      ]);
    });
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
    await transaction(async (c) => {
      await c.query('SELECT id FROM products WHERE id=$1 FOR UPDATE', [id]);
      await c.query(
        'INSERT INTO media_cleanup(object_key) SELECT object_key FROM images WHERE product_id=$1 AND object_key IS NOT NULL ON CONFLICT DO NOTHING',
        [id],
      );
      await c.query('DELETE FROM products WHERE id=$1', [id]);
    });
  } catch {
    return { error: 'No se ha podido eliminar la prenda.' };
  }
  revalidatePath('/', 'layout');
  return { success: 'Prenda eliminada.' };
}
