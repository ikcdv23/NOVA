import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="page-wrap empty-state">
      <h1>Fuera del archivo</h1>
      <p>Esta página o prenda no está disponible.</p>
      <Link href="/catalogo" className="button">
        Volver a la colección ↗
      </Link>
    </div>
  );
}
