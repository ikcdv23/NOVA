import Link from 'next/link';
import { store } from '@/config/store';
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p>
          Buenas prendas.
          <br />
          Nuevas historias.
        </p>
        <nav aria-label="Enlaces al pie">
          <Link href="/catalogo">Explorar la colección</Link>
          <Link href="/contacto">Hablemos</Link>
          <a href={store.instagram} target="_blank" rel="noreferrer">
            Instagram ↗
          </a>
          <Link href="/admin">Acceso privado</Link>
        </nav>
      </div>
      <div className="footer-name">
        {store.shortName}
        <span>Archive</span>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {store.name}
        </span>
        <span>Ropa nueva & segunda mano</span>
        <Link href="/sobre-la-tienda#plantilla">Acerca de esta plantilla</Link>
      </div>
    </footer>
  );
}
