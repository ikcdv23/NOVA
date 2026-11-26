'use client';
import { StoreImage } from '@/components/store-image';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { money } from '@/config/store';
import { collections, type Product } from '@/modules/catalog/types';
import { deleteProduct, setVisibility } from '@/modules/admin/actions/admin-actions';
import { runCleanup } from '@/modules/media/actions/media-actions';
export function Inventory({ products }: { products: Product[] }) {
  const [query, setQuery] = useState(''),
    [filter, setFilter] = useState('all'),
    [message, setMessage] = useState(''),
    [pending, start] = useTransition(),
    [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const rows = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === 'all' || (filter === 'published' ? p.published : !p.published)),
  );
  function run(work: () => Promise<{ error?: string; success?: string }>) {
    start(async () => {
      try {
        const result = await work();
        setMessage(result.error ?? result.success ?? '');
        setDeleteId(null);
        router.refresh();
      } catch {
        setMessage('No se ha podido completar la acción. Vuelve a iniciar sesión si ha caducado.');
      }
    });
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>El inventario</h1>
          <p>
            {products.length} prendas ·{' '}
            {products.reduce((s, p) => s + p.variants.reduce((t, v) => t + v.stock, 0), 0)} unidades
          </p>
        </div>
        <Link className="button" href="/admin/prendas/nueva">
          Añadir prenda +
        </Link>
      </div>
      <div className="inventory-filters">
        <label>
          Buscar en el inventario
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre de la prenda"
            type="search"
          />
        </label>
        <label>
          Visibilidad
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas ({products.length})</option>
            <option value="published">
              Publicadas ({products.filter((p) => p.published).length})
            </option>
            <option value="draft">Ocultas ({products.filter((p) => !p.published).length})</option>
          </select>
        </label>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <div className="table-scroll">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Prenda</th>
              <th>Colección</th>
              <th>Precio</th>
              <th>Tallas / stock</th>
              <th>Visibilidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link className="inventory-name" href={`/admin/prendas/${p.id}`}>
                    {p.images[0] && (
                      <StoreImage src={p.images[0].url} alt="" width="48" height="60" />
                    )}
                    <span>
                      {p.name}
                      <small>{p.category}</small>
                    </span>
                  </Link>
                </td>
                <td>{collections[p.collection]}</td>
                <td className="numeric">{money(p.priceCents)}</td>
                <td>{p.variants.map((v) => `${v.size}: ${v.stock}`).join(' · ')}</td>
                <td>{p.published ? 'Publicada' : 'Oculta'}</td>
                <td>
                  <div className="row-actions">
                    <Link href={`/admin/prendas/${p.id}`}>Editar</Link>
                    <button
                      disabled={pending}
                      onClick={() => run(() => setVisibility(p.id, !p.published))}
                    >
                      {p.published ? 'Ocultar' : 'Publicar'}
                    </button>
                    <button disabled={pending} onClick={() => setDeleteId(p.id)}>
                      Eliminar
                    </button>
                  </div>
                  {deleteId === p.id && (
                    <div className="delete-confirm" role="alert">
                      <p>¿Eliminar «{p.name}» y sus fotos? No se puede deshacer.</p>
                      <button disabled={pending} onClick={() => run(() => deleteProduct(p.id))}>
                        Sí, eliminar
                      </button>
                      <button onClick={() => setDeleteId(null)}>Cancelar</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="empty-state">
          <p>No hay prendas que mostrar.</p>
          <Link href="/admin/prendas/nueva">Crear una prenda →</Link>
        </div>
      )}
      <div className="admin-maintenance">
        <p>
          Al borrar fotos o prendas, los archivos se retiran del catálogo al instante. Completa aquí
          su eliminación del bucket.
        </p>
        <button className="text-button" disabled={pending} onClick={() => run(runCleanup)}>
          Limpiar archivos pendientes
        </button>
      </div>
    </>
  );
}
