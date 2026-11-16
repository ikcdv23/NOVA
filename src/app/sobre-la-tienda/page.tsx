import { StoreImage } from '@/components/store-image';
import Link from 'next/link';
export const metadata = { title: 'Nuestra historia' };
export default function About() {
  return (
    <div className="page-wrap">
      <div className="about-grid">
        <div>
          <h1>
            El estilo
            <br />
            no caduca.
          </h1>
          <p className="lead">
            NOVA Archive es una forma de mirar la ropa: con curiosidad por su pasado y ganas de
            darle un presente.
          </p>
          <p>
            Nos interesan las siluetas relajadas, las texturas que ganan con el tiempo y los básicos
            que vuelven una y otra vez. Reunimos prendas nuevas y de segunda mano en un mismo
            archivo, para que elijas con tu propio criterio.
          </p>
          <p>
            Cada ficha muestra la talla, las medidas y el estado de conservación. Si algo no está
            claro, lo hablamos. La compra empieza con una conversación, sin prisas.
          </p>
          <Link className="button" href="/catalogo">
            Explorar el archivo ↗
          </Link>
        </div>
        <StoreImage
          src="/images/editorial.png"
          alt="Chaqueta de piel y denim, el espíritu de NOVA Archive"
          width="800"
          height="1000"
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
        <h2>Una marca de ejemplo</h2>
        <p>
          NOVA Archive es una marca ficticia. Las prendas, los textos y las imágenes generadas con
          IA forman parte de una plantilla demostrativa y deben sustituirse por el contenido real de
          la tienda antes de abrirla al público.
        </p>
      </section>
    </div>
  );
}
