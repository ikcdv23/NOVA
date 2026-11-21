import Link from 'next/link';
import { getPublicProducts } from '@/modules/catalog/service/catalog-service';
import { ProductCard } from '@/components/catalog/product-card';
import { categories, conditions, type Filters } from '@/modules/catalog/types';
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
        <h1>El archivo</h1>
        <p>Encuentra esa prenda que parece hecha para ti.</p>
      </div>
      <form className="catalog-filters" action="/catalogo" data-ui>
        <div className="search-row">
          <label className="search-field">
            Buscar prendas
            <input
              name="q"
              type="search"
              placeholder="Una chaqueta, unos vaqueros…"
              defaultValue={filters.q}
            />
          </label>
          <label>
            Colección
            <select name="collection" defaultValue={filters.collection ?? ''}>
              <option value="">Todo el archivo</option>
              <option value="nueva">Ropa nueva</option>
              <option value="vintage">Vintage / segunda mano</option>
            </select>
          </label>
        </div>
        <div className="filter-row">
          <label>
            Categoría
            <select name="category" defaultValue={filters.category ?? ''}>
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Talla
            <select name="size" defaultValue={filters.size ?? ''}>
              <option value="">Todas</option>
              {sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Desde (€)
            <input
              name="min"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              defaultValue={filters.min}
            />
          </label>
          <label>
            Hasta (€)
            <input
              name="max"
              type="number"
              min="0"
              step="0.01"
              placeholder="Sin límite"
              defaultValue={filters.max}
            />
          </label>
          <label>
            Estado
            <select name="condition" defaultValue={filters.condition ?? ''}>
              <option value="">Todos</option>
              {conditions.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Ordenar
            <select name="sort" defaultValue={filters.sort ?? ''}>
              <option value="">Más recientes</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
          </label>
        </div>
        <div className="filter-bottom">
          <label className="checkbox">
            <input
              type="checkbox"
              name="available"
              value="true"
              defaultChecked={filters.available === 'true'}
            />{' '}
            Solo disponibles
          </label>
          <div>
            <Link className="text-link" href="/catalogo">
              Limpiar
            </Link>
            <button className="button" type="submit">
              Aplicar filtros ↗
            </button>
          </div>
        </div>
      </form>
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
