import Link from 'next/link';
import { categories, conditions, type Filters } from '@/modules/catalog/types';

/** Server-rendered GET form: native disclosure, no browser state or new API. */
export function CatalogFilters({ filters, sizes }: { filters: Filters; sizes: string[] }) {
  return (
    <details
      className="catalog-tools"
      open={Object.entries(filters).some(([key, value]) => key !== 'collection' && Boolean(value))}
    >
      <summary>
        Filtrar y ordenar <span aria-hidden="true">+</span>
      </summary>
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
              <option value="">Todas las prendas</option>
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
    </details>
  );
}
