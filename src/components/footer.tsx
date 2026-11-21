import Link from 'next/link';
import { store } from '@/config/store';
import { Wordmark } from '@/components/brand/wordmark';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-intro">
          <p>
            Tu próxima prenda
            <br />
            empieza aquí.
          </p>
          <span>Ropa nueva y vintage. A tu manera.</span>
        </div>
        <nav aria-label="Enlaces al pie">
          <div>
            <Link href="/catalogo">Explorar la colección</Link>
            <Link href="/catalogo?collection=nueva">Ropa nueva</Link>
            <Link href="/catalogo?collection=vintage">Vintage</Link>
          </div>
          <div>
            <Link href="/sobre-la-tienda">Sobre {store.name}</Link>
            <Link href="/contacto">Contacto</Link>
            <a href={store.instagram} target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
            <Link href="/admin">Acceso privado</Link>
          </div>
        </nav>
      </div>
      <Wordmark className="footer-name" />
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {store.name}
        </span>
        <span>Compra por WhatsApp · Sin reserva automática</span>
        <Link href="/sobre-la-tienda#plantilla">Sobre las imágenes</Link>
      </div>
    </footer>
  );
}
