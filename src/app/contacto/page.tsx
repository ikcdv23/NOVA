import { store } from '@/config/store';
export const metadata = { title: 'Contacto' };
export default function Contact() {
  return (
    <div className="page-wrap contact-page">
      <div>
        <h1>
          Hablemos
          <br />
          de esa prenda.
        </h1>
        <p className="lead">
          Una talla, una medida o una segunda opinión. Te ayudamos a encontrar lo que encaja
          contigo.
        </p>
        <a
          className="button"
          href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent('Hola, NOVA Archive. Me gustaría consultar sobre una prenda.')}`}
          target="_blank"
          rel="noreferrer"
        >
          Abrir WhatsApp ↗
        </a>
        <p className="small">+34 695 056 234</p>
      </div>
      <div className="contact-details">
        <div>
          <h2>Por correo</h2>
          <a href={`mailto:${store.email}`}>{store.email}</a>
          <p className="small">Dirección de ejemplo. Configura el correo real de tu tienda.</p>
        </div>
        <div>
          <h2>Entre novedades</h2>
          <a href={store.instagram} target="_blank" rel="noreferrer">
            Instagram ↗
          </a>
          <p className="small">Enlace de ejemplo. Sustituye por el perfil de la tienda.</p>
        </div>
        <div>
          <h2>¿Cómo funciona?</h2>
          <p>
            Añade prendas a tu selección y envíanos la solicitud por WhatsApp. Te confirmaremos
            disponibilidad, importe final y opciones de entrega antes de acordar la compra.
          </p>
        </div>
      </div>
    </div>
  );
}
