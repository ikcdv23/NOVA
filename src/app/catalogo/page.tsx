import Link from 'next/link';
import { getPublicProducts } from '@/modules/catalog/service/catalog-service';
import { ProductCard } from '@/components/catalog/product-card';
import type { Filters } from '@/modules/catalog/types';
import { CatalogFilters } from '@/components/catalog/catalog-filters';
import { Reveal } from '@/components/reveal';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'La colección' };
export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, typeof v === 'string' ? v : '']),
  ) as Filters;
  const [products, all] = await Promise.all([getPublicProducts(filters), getPublicProducts()]);
  const sizes = [...new Set(all.flatMap((p) => p.variants.map((v) => v.size)))].sort();
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <h1>La colección</h1>
        <p>Ropa nueva y vintage. Encuentra la tuya.</p>
        <nav className="catalog-categories" aria-label="Colecciones">
          <Link href="/catalogo" aria-current={!filters.collection ? 'page' : undefined}>
            Todo
          </Link>
          <Link
            href="/catalogo?collection=nueva"
            aria-current={filters.collection === 'nueva' ? 'page' : undefined}
          >
            Ropa nueva
          </Link>
          <Link
            href="/catalogo?collection=vintage"
            aria-current={filters.collection === 'vintage' ? 'page' : undefined}
          >
            Vintage
          </Link>
        </nav>
      </div>
      <CatalogFilters filters={filters} sizes={sizes} />
      <div className="results-count" aria-live="polite">
        {products.length} {products.length === 1 ? 'prenda' : 'prendas'}
      </div>
      {products.length ? (
        <div className="catalog-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No hay coincidencias</h2>
          <p>Prueba con otra talla o amplía el rango de precio.</p>
          <Link className="button" href="/catalogo">
            Ver todas las prendas ↗
          </Link>
        </div>
      )}
      <Reveal key={JSON.stringify(filters)} />
    </div>
  );
}
