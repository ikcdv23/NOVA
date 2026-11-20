import 'server-only';
import { db } from '@/lib/db';
import type { Product } from '../types';

const select = `SELECT p.id, p.name, p.slug, p.collection, p.category, p.price_cents AS "priceCents",
 p.description, p.condition, p.measurements, p.published, p.featured,
 COALESCE((SELECT json_agg(json_build_object('size',v.size,'stock',v.stock) ORDER BY v.position) FROM variants v WHERE v.product_id=p.id),'[]') AS variants,
 COALESCE((SELECT json_agg(json_build_object('id',i.id,'url',COALESCE(i.sample_url,'/media/'||i.id),'alt',i.alt,'position',i.position) ORDER BY i.position,i.id) FROM images i WHERE i.product_id=p.id),'[]') AS images
 FROM products p`;

export async function findPublishedProducts(): Promise<Product[]> {
  return (await db.query<Product>(`${select} WHERE p.published=true ORDER BY p.created_at DESC`))
    .rows;
}
export async function findAdminProducts(): Promise<Product[]> {
  return (await db.query<Product>(`${select} ORDER BY p.created_at DESC`)).rows;
}
export async function findAdminProduct(id: string): Promise<Product | undefined> {
  return (await db.query<Product>(`${select} WHERE p.id=$1`, [id])).rows[0];
}
