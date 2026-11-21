import Link from 'next/link';
import { StoreImage } from '@/components/store-image';
import { store } from '@/config/store';

export function CampaignHero() {
  return (
    <section className="campaign-hero" aria-labelledby="campaign-title">
      <StoreImage
        className="campaign-image"
        src="/images/bamba-campaign.webp"
        alt="Editorial D Bamba: denim oscuro y silueta relajada en un escenario de hormigón"
        width={1774}
        height={887}
        sizes="(max-width: 1100px) 1500px, 100vw"
        fetchPriority="high"
      />
      <div className="campaign-content">
        <h1 id="campaign-title">{store.name}</h1>
        <div className="campaign-bottom">
          <p>
            Ropa masculina nueva y vintage.
            <br />
            Tu forma de llevarlo.
          </p>
          <Link className="button light" href="/catalogo">
            Explorar la colección <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
