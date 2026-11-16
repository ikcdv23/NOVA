'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page-wrap empty-state">
      <h1>Volvemos enseguida</h1>
      <p>No hemos podido cargar esta página. Inténtalo de nuevo en un momento.</p>
      <button className="button" onClick={reset}>
        Reintentar
      </button>
    </div>
  );
}
