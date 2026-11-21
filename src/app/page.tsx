import Link from 'next/link';
import { getPublicProducts } from '@/modules/catalog/service/catalog-service';
import { ProductCard } from '@/components/catalog/product-card';
import { Reveal } from '@/components/reveal';
import { CampaignHero } from '@/components/home/campaign-hero';
import { CollectionStories } from '@/components/home/collection-stories';
import { BrandStory } from '@/components/home/brand-story';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const featured = (await getPublicProducts()).filter((product) => product.featured).slice(0, 4);
  return (
    <>
      <CampaignHero />
      <section className="featured section-pad" id="seleccion" aria-labelledby="selection-title">
        <div className="section-heading" data-reveal>
          <div>
            <h2 id="selection-title">La selección</h2>
            <p>Prendas para hacer tuyas.</p>
          </div>
          <Link className="text-link" href="/catalogo">
            Ver todo <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {featured.length ? (
          <div className="featured-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="selection-empty">
            <p>Estamos preparando la próxima selección.</p>
            <Link className="text-link" href="/catalogo">
              Explorar la colección ↗
            </Link>
          </div>
        )}
      </section>
      <CollectionStories />
      <BrandStory />
      <section className="contact-strip section-pad" aria-labelledby="contact-title">
        <h2 id="contact-title" data-reveal>
          Antes de decidir.
        </h2>
        <p data-reveal>Una talla, una medida o una foto más. Escríbenos y lo vemos contigo.</p>
        <Link className="button light" href="/contacto" data-reveal>
          Hablemos <span aria-hidden="true">↗</span>
        </Link>
      </section>
      <Reveal />
    </>
  );
}
