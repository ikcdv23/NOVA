import { StoreImage } from '@/components/store-image';
import Link from 'next/link';
import { store } from '@/config/store';
export const metadata = { title: 'Nuestra historia' };
export default function About() {
  return (
    <div className="page-wrap">
      <div className="about-grid">
        <div>
          <h1>
            Tu forma
            <br />
            de llevarlo.
          </h1>
          <p className="lead">
            {store.name} reúne ropa masculina nueva y vintage. Prendas con carácter, elegidas para
            que las hagas tuyas.
          </p>
          <p>
            Nos interesan las siluetas relajadas, las texturas que ganan con el tiempo y los básicos
            que vuelven una y otra vez. Reunimos prendas nuevas y de segunda mano en un mismo lugar,
            para que elijas con tu propio criterio.
          </p>
          <p>
            Cada ficha muestra la talla, las medidas y el estado de conservación. Si algo no está
            claro, lo hablamos. La compra empieza con una conversación, sin prisas.
          </p>
          <Link className="button" href="/catalogo">
            Explorar la colección ↗
          </Link>
        </div>
        <StoreImage
          src="/images/bamba-campaign.webp"
          alt="Editorial D Bamba: denim oscuro y ropa de corte relajado"
          width="800"
          height="1000"
          sizes="(max-width: 767px) 1100px, 1500px"
        />
      </div>
      <section className="about-notes">
        <h2>Antes de elegir</h2>
        <div>
          <h3>La talla es el principio</h3>
          <p>
            Compara las medidas con una prenda que ya te quede bien. Las tallas vintage pueden
            variar según la época y el corte.
          </p>
        </div>
        <div>
          <h3>El tiempo deja carácter</h3>
          <p>
            Las marcas de uso se describen en cada ficha. Puedes pedir detalles o fotos adicionales
            por WhatsApp antes de decidir.
          </p>
        </div>
      </section>
      <section id="plantilla" className="template-note">
        <h2>Sobre estas imágenes</h2>
        <p>
          Las imágenes de campaña y las prendas del catálogo de demostración se han generado con IA
          para presentar la dirección visual de {store.name}. No representan existencias reales. El
          catálogo, las fotografías y los datos de contacto deben completarse con la información de
          la tienda antes de abrirla al público.
        </p>
      </section>
    </div>
  );
}
