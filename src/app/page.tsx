import { StoreImage } from '@/components/store-image';
import Link from 'next/link';
import { getPublicProducts } from '@/modules/catalog/service/catalog-service';
import { ProductCard } from '@/components/catalog/product-card';
import { Reveal } from '@/components/reveal';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const featured = (await getPublicProducts()).filter((p) => p.featured).slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="hero-title">
          <h1>
            Buen pasado.
            <br />
            <span>Mejor presente.</span>
          </h1>
        </div>
        <figure className="hero-small">
          <StoreImage
            src="/images/knit.png"
            alt="Textura de un jersey de lana color avena"
            width="400"
            height="500"
          />
        </figure>
        <figure className="hero-photo">
          <StoreImage
            src="/images/editorial.png"
            alt="Estilo NOVA: chaqueta de piel marrón y denim de corte relajado"
            width="900"
            height="1125"
            fetchPriority="high"
          />
          <figcaption>El archivo se lleva puesto.</figcaption>
        </figure>
        <div className="hero-copy">
          <p>
            Ropa masculina nueva y vintage. <br />
            Una selección con carácter, para vestir a tu manera.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/catalogo?collection=vintage">
              Vintage / segunda mano <span>↗</span>
            </Link>
            <Link className="text-link" href="/catalogo?collection=nueva">
              Ropa nueva <span>↗</span>
            </Link>
          </div>
        </div>
        <div className="hero-foot">
          <a href="#seleccion">Descubre el archivo ↓</a>
        </div>
      </section>
      <section className="featured section-pad" id="seleccion">
        <div className="section-heading" data-reveal>
          <div>
            <h2>En nuestro radar</h2>
            <p>Prendas que merecen otra mirada.</p>
          </div>
          <Link className="text-link" href="/catalogo">
            Ver toda la colección ↗
          </Link>
        </div>
        <div className="featured-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="collection-story section-pad">
        <div className="story-copy">
          <h2 data-reveal>
            Dos caminos.
            <br />
            El mismo criterio.
          </h2>
          <p data-reveal>
            Lo nuevo que encaja contigo. Lo de antes que sigue teniendo algo que decir. Elige por
            cómo te queda, cómo se siente y lo que cuenta.
          </p>
          <Link className="text-link" href="/sobre-la-tienda" data-reveal>
            Conoce NOVA Archive ↗
          </Link>
        </div>
        <div className="collection-links">
          <Link href="/catalogo?collection=nueva" className="collection-panel" data-reveal>
            <StoreImage
              src="/images/shirt.png"
              alt="Camisa Oxford azul de la colección nueva"
              width="600"
              height="750"
              loading="lazy"
            />
            <div>
              <h3>Ropa nueva</h3>
              <span>Para empezar historias ↗</span>
            </div>
          </Link>
          <Link href="/catalogo?collection=vintage" className="collection-panel" data-reveal>
            <StoreImage
              src="/images/bomber.png"
              alt="Chaqueta de piel de la selección vintage"
              width="600"
              height="750"
              loading="lazy"
            />
            <div>
              <h3>Vintage</h3>
              <span>Para seguir contándolas ↗</span>
            </div>
          </Link>
        </div>
      </section>
      <section className="contact-strip section-pad">
        <h2 data-reveal>¿Lo vemos juntos?</h2>
        <p data-reveal>
          Una duda con la talla, una medida más o esa prenda que llevas buscando. Estamos al otro
          lado.
        </p>
        <Link href="/contacto" className="button light" data-reveal>
          Habla con nosotros ↗
        </Link>
      </section>
      <Reveal />
    </>
  );
}
