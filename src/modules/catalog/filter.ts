import type { Filters, Product } from './types';
export function filterProducts(products: Product[], f: Filters) {
  const q = (f.q ?? '').trim().toLocaleLowerCase('es');
  const min = f.min?.trim() ? Number(f.min.replace(',', '.')) : undefined;
  const max = f.max?.trim() ? Number(f.max.replace(',', '.')) : undefined;
  const result = products.filter(
    (p) =>
      p.published &&
      (!q || p.name.toLocaleLowerCase('es').includes(q)) &&
      (!f.collection || p.collection === f.collection) &&
      (!f.category || p.category === f.category) &&
      (!f.size || p.variants.some((v) => v.size === f.size)) &&
      (min === undefined || !Number.isFinite(min) || p.priceCents >= Math.round(min * 100)) &&
      (max === undefined || !Number.isFinite(max) || p.priceCents <= Math.round(max * 100)) &&
      (!f.condition || p.condition === f.condition) &&
      (f.available !== 'true' ||
        p.variants.some((v) => v.stock > 0 && (!f.size || v.size === f.size))),
  );
  if (f.sort === 'price-asc') result.sort((a, b) => a.priceCents - b.priceCents);
  if (f.sort === 'price-desc') result.sort((a, b) => b.priceCents - a.priceCents);
  return result;
}
