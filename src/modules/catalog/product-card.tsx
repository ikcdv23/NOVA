import { StoreImage } from '@/components/store-image';
import Link from 'next/link';
import { money } from '@/config/store';
import { collections, type Product } from './types';
export function ProductCard({ product: p }: { product: Product }) {
  const stock = p.variants.reduce((s, v) => s + v.stock, 0);
  return (
    <article className="product-card" data-reveal>
      <Link href={`/producto/${p.slug}`} className="product-image" aria-label={`Ver ${p.name}`}>
        {p.images[0] ? (
          <StoreImage
            src={p.images[0].url}
            alt={p.images[0].alt}
            width="600"
            height="750"
            loading="lazy"
          />
        ) : (
          <div className="no-photo">Sin fotografía</div>
        )}
        <span className="collection-tag">{collections[p.collection]}</span>
        {stock === 0 && <span className="sold-tag">Agotada</span>}
        <span className="product-arrow" aria-hidden="true">
          ↗
        </span>
      </Link>
      <div className="product-meta">
        <div>
          <h3>
            <Link href={`/producto/${p.slug}`}>{p.name}</Link>
          </h3>
          <p>
            {p.category} · {p.variants.map((v) => v.size).join(' / ')}
          </p>
        </div>
        <span>{money(p.priceCents)}</span>
      </div>
    </article>
  );
}
