import 'server-only';
import type { PoolClient } from 'pg';
import type { z } from 'zod';
import type { productSchema } from '../validation';

type ProductInput = z.output<typeof productSchema>;

export async function lockProduct(db: PoolClient, id: string) {
  return (await db.query('SELECT id FROM products WHERE id=$1 FOR UPDATE', [id])).rowCount;
}

export async function countImages(db: PoolClient, id: string) {
  const result = await db.query('SELECT id FROM images WHERE product_id=$1 ORDER BY position,id', [
    id,
  ]);
  return result.rows.length;
}

export async function slugExists(db: PoolClient, slug: string, id: string) {
  return (
    (await db.query('SELECT id FROM products WHERE slug=$1 AND id<>$2', [slug, id])).rowCount !== 0
  );
}

export async function saveProduct(
  db: PoolClient,
  id: string,
  product: ProductInput,
  slug: string,
  editing: boolean,
) {
  const values = [
    id,
    product.name,
    slug,
    product.collection,
    product.category,
    product.price,
    product.measurements,
    product.description,
    product.condition,
    product.published,
    product.featured,
  ];
  if (editing) {
    await db.query(
      `UPDATE products SET name=$2,slug=$3,collection=$4,category=$5,price_cents=$6,measurements=$7,description=$8,condition=$9,published=$10,featured=$11,updated_at=now() WHERE id=$1`,
      values,
    );
  } else {
    await db.query(
      `INSERT INTO products(id,name,slug,collection,category,price_cents,measurements,description,condition,published,featured) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      values,
    );
  }
  await db.query('DELETE FROM variants WHERE product_id=$1', [id]);
  for (const [position, variant] of product.variants.entries()) {
    await db.query('INSERT INTO variants(product_id,size,stock,position) VALUES($1,$2,$3,$4)', [
      id,
      variant.size,
      variant.stock,
      position,
    ]);
  }
}

export async function setVisibility(db: PoolClient, id: string, published: boolean) {
  await db.query('UPDATE products SET published=$2,updated_at=now() WHERE id=$1', [id, published]);
}

export async function deleteProduct(db: PoolClient, id: string) {
  await db.query(
    'INSERT INTO media_cleanup(object_key) SELECT object_key FROM images WHERE product_id=$1 AND object_key IS NOT NULL ON CONFLICT DO NOTHING',
    [id],
  );
  await db.query('DELETE FROM products WHERE id=$1', [id]);
}
