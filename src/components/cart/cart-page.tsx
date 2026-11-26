'use client';
import { StoreImage } from '@/components/store-image';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '@/modules/cart/provider';
import { prepareWhatsApp } from '@/modules/cart/actions/cart-actions';
import { money } from '@/config/store';
import type { Product } from '@/modules/catalog/types';
export function CartPage({ products }: { products: Product[] }) {
  const { items, ready, update, remove } = useCart();
  const [error, setError] = useState(''),
    [pending, setPending] = useState(false);
  const rows = items.map((i) => ({ item: i, p: products.find((p) => p.id === i.productId) }));
  const total = rows.reduce((sum, { item, p }) => sum + (p?.priceCents ?? 0) * item.quantity, 0);
  async function request() {
    setPending(true);
    setError('');
    try {
      const result = await prepareWhatsApp(items);
      if (result.error) setError(result.error);
      if (result.url) window.location.assign(result.url);
    } catch {
      setError('No se ha podido conectar. Vuelve a intentarlo.');
    } finally {
      setPending(false);
    }
  }
  if (!ready) return <p role="status">Cargando tu selección…</p>;
  if (!items.length)
    return (
      <div className="empty-state">
        <p>Todavía no hay prendas en tu selección.</p>
        <Link className="button" href="/catalogo">
          Encontrar mi próxima prenda ↗
        </Link>
      </div>
    );
  return (
    <div className="cart-layout">
      <div className="cart-lines">
        {rows.map(({ item, p }) => {
          const stock = p?.variants.find((v) => v.size === item.size)?.stock ?? 0;
          return (
            <article className="cart-line" key={`${item.productId}:${item.size}`}>
              {p?.images[0] && (
                <Link href={`/producto/${p.slug}`}>
                  <StoreImage src={p.images[0].url} alt={p.name} width="160" height="200" />
                </Link>
              )}
              <div className="cart-line-info">
                <h2>{p?.name ?? 'Prenda retirada'}</h2>
                <p>
                  Talla {item.size} · {p ? money(p.priceCents) : 'No disponible'}
                </p>
                <div className="quantity">
                  <button
                    aria-label={`Reducir cantidad de ${p?.name}`}
                    disabled={item.quantity <= 1}
                    onClick={() => update(item.productId, item.size, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    aria-label={`Aumentar cantidad de ${p?.name}`}
                    disabled={item.quantity >= Math.min(stock, 99)}
                    onClick={() => update(item.productId, item.size, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                {item.quantity > stock && (
                  <p className="error-text">
                    {stock ? 'Reduce la cantidad disponible.' : 'Esta talla ya no está disponible.'}
                  </p>
                )}
                <button className="text-button" onClick={() => remove(item.productId, item.size)}>
                  Quitar
                </button>
              </div>
              <span className="line-total">{p ? money(p.priceCents * item.quantity) : '—'}</span>
            </article>
          );
        })}
      </div>
      <aside className="cart-summary">
        <h2>Tu selección, lista.</h2>
        <div className="summary-total">
          <span>Total de prendas</span>
          <strong>{money(total)}</strong>
        </div>
        <p>Revisaremos contigo la disponibilidad y los detalles de entrega.</p>
        <button className="button full" disabled={pending} onClick={request}>
          {pending ? 'Comprobando…' : 'Solicitar por WhatsApp'} <span>↗</span>
        </button>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <p className="small">
          Sin pago online ni reserva automática. El envío, si corresponde, se acuerda con la tienda.
        </p>
        <Link className="text-link" href="/catalogo">
          Seguir explorando →
        </Link>
      </aside>
    </div>
  );
}
