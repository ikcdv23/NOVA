import Link from 'next/link';
import { StoreImage } from '@/components/store-image';

const collections = [
  {
    name: 'Ropa nueva',
    description: 'Básicos para llevar a diario.',
    href: '/catalogo?collection=nueva',
    image: '/images/shirt.png',
    alt: 'Camisa Oxford azul sobre fondo de estudio',
  },
  {
    name: 'Vintage',
    description: 'Prendas con una vida por delante.',
    href: '/catalogo?collection=vintage',
    image: '/images/bomber.png',
    alt: 'Chaqueta de piel marrón de la selección vintage',
  },
];

export function CollectionStories() {
  return (
    <section className="collection-stories section-pad" aria-labelledby="collections-title">
      <div className="section-heading" data-reveal>
        <h2 id="collections-title">Encuentra tu sitio</h2>
        <p>Dos colecciones. Elige por cómo lo llevas.</p>
      </div>
      <div className="collection-links">
        {collections.map((collection) => (
          <Link
            key={collection.href}
            href={collection.href}
            className="collection-panel"
            data-reveal
          >
            <div className="collection-picture">
              <StoreImage
                src={collection.image}
                alt={collection.alt}
                width={900}
                height={1125}
                sizes="(max-width: 767px) 100vw, 50vw"
              />
            </div>
            <div className="collection-panel-copy">
              <div>
                <h3>{collection.name}</h3>
                <p>{collection.description}</p>
              </div>
              <span aria-hidden="true">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
