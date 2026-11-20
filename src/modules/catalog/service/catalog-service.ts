import 'server-only';
import { isDemo } from '@/lib/db';
import { requireAdmin } from '@/modules/auth/session';
import { demoProducts } from '../demo';
import { filterProducts } from '../filter';
import * as repository from '../repository/catalog-repository';
import type { Filters } from '../types';

export async function getPublicProducts(filters: Filters = {}) {
  const products = isDemo() ? demoProducts : await repository.findPublishedProducts();
  return filterProducts(products, filters);
}

export async function getProduct(slug: string) {
  return (await getPublicProducts()).find((product) => product.slug === slug);
}

export async function getAdminProducts() {
  await requireAdmin();
  return repository.findAdminProducts();
}

export async function getAdminProduct(id: string) {
  await requireAdmin();
  return repository.findAdminProduct(id);
}
