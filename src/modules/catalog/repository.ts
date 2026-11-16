import 'server-only';
import { db, isDemo } from '@/lib/db';
import { demoProducts } from './demo';
import { filterProducts } from './filter';
import type { Filters, Product } from './types';
import { requireAdmin } from '@/modules/auth/session';
const select = `SELECT p.id, p.name, p.slug, p.collection, p.category, p.price_cents AS "priceCents",
 p.description, p.condition, p.measurements, p.published, p.featured,
 COALESCE((SELECT json_agg(json_build_object('size',v.size,'stock',v.stock) ORDER BY v.position) FROM variants v WHERE v.product_id=p.id),'[]') AS variants,
 COALESCE((SELECT json_agg(json_build_object('id',i.id,'url',COALESCE(i.sample_url,'/media/'||i.id),'alt',i.alt,'position',i.position) ORDER BY i.position,i.id) FROM images i WHERE i.product_id=p.id),'[]') AS images
 FROM products p`;
export async function getPublicProducts(filters: Filters = {}): Promise<Product[]> {
  const products = isDemo()
    ? demoProducts
    : (await db.query<Product>(`${select} WHERE p.published=true ORDER BY p.created_at DESC`)).rows;
  return filterProducts(products, filters);
}
export async function getProduct(slug: string) {
  return (await getPublicProducts()).find((p) => p.slug === slug);
}
// Callers of these private queries must authenticate at the boundary.
export async function getAdminProducts(): Promise<Product[]> {
  await requireAdmin();
  return (await db.query<Product>(`${select} ORDER BY p.created_at DESC`)).rows;
}
export async function getAdminProduct(id: string): Promise<Product | undefined> {
  await requireAdmin();
  return (await db.query<Product>(`${select} WHERE p.id=$1`, [id])).rows[0];
}
