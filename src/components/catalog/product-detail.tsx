'use client';
import { StoreImage } from '@/components/store-image';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/modules/cart/provider';
import { money } from '@/config/store';
import { collections, type Product } from '@/modules/catalog/types';
export function ProductDetail({ product: p }: { product: Product }) {
  const [photo, setPhoto] = useState(0),
    [size, setSize] = useState(
      p.variants.find((v) => v.stock > 0)?.size ?? p.variants[0]?.size ?? '',
    );
  const { add, ready } = useCart();
  const variant = p.variants.find((v) => v.size === size),
    image = p.images[photo];
  return (
    <div className="product-detail">
      <div className="gallery">
        <div className="gallery-main">
          {image ? (
            <StoreImage
              src={image.url}
              alt={image.alt}
              width="900"
              height="1125"
              fetchPriority="high"
            />
          ) : (
            <div className="no-photo">Sin fotografía</div>
          )}
        </div>
        {p.images.length > 1 && (
          <div className="thumbnails">
            {p.images.map((i, n) => (
              <button
                key={i.id}
                aria-label={`Ver foto ${n + 1}`}
                aria-pressed={n === photo}
                onClick={() => setPhoto(n)}
              >
                <StoreImage src={i.url} alt={i.alt} width="100" height="125" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="product-info">
        <Link className="back-link" href="/catalogo">
          ← Volver a la colección
        </Link>
        <h1>{p.name}</h1>
        <div className="detail-price">
          <span>{money(p.priceCents)}</span>
          <span className="label">{collections[p.collection]}</span>
        </div>
        <p className="description">{p.description}</p>
        <fieldset className="sizes">
          <legend>Talla</legend>
          {p.variants.map((v) => (
            <button
              key={v.size}
              aria-pressed={size === v.size}
              onClick={() => setSize(v.size)}
              className={size === v.size ? 'selected' : ''}
            >
              {v.size}
              {v.stock === 0 ? ' · Agotada' : ''}
            </button>
          ))}
        </fieldset>
        <p className="stock">
          {variant?.stock
            ? `${variant.stock} ${variant.stock === 1 ? 'unidad disponible' : 'unidades disponibles'} en esta talla`
            : 'Sin unidades disponibles en esta talla'}
        </p>
        <button
          className="button full"
          disabled={!ready || !variant?.stock}
          onClick={() => variant && add(p.id, size, variant.stock)}
        >
          {variant?.stock ? 'Añadir a mi selección' : 'Agotada'} <span aria-hidden="true">↗</span>
        </button>
        <Link className="text-link" href="/carrito">
          Ver mi selección →
        </Link>
        <p className="small muted">
          La disponibilidad se confirma por WhatsApp. Añadir al carrito no reserva la prenda.
        </p>
        <dl className="specs">
          <div>
            <dt>Categoría</dt>
            <dd>{p.category}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>{p.condition}</dd>
          </div>
          <div>
            <dt>Medidas</dt>
            <dd>{p.measurements}</dd>
          </div>
          <div>
            <dt>Unidades totales</dt>
            <dd>{p.variants.reduce((s, v) => s + v.stock, 0)}</dd>
          </div>
        </dl>
        <p className="small">
          Compara las medidas con una prenda tuya, extendida sobre una superficie plana.
        </p>
      </div>
    </div>
  );
}
