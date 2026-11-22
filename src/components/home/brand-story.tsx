import Link from 'next/link';
import { store } from '@/config/store';

export function BrandStory() {
  return (
    <section className="brand-story section-pad" aria-labelledby="brand-story-title">
      <h2 id="brand-story-title" data-reveal>
        El estilo lo pones tú.
      </h2>
      <div data-reveal>
        <p>
          Denim, prendas de abrigo y básicos. Reunimos ropa nueva y vintage para que encuentres la
          que encaja contigo, sin importar de dónde venga.
        </p>
        <Link className="text-link" href="/sobre-la-tienda">
          Conoce {store.name} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
