'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/modules/cart/provider';
import { store } from '@/config/store';
export function Header() {
  const path = usePathname(),
    [open, setOpen] = useState(false),
    { items } = useCart();
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label={`${store.name}, inicio`}>
        {store.shortName}
        <span>Archive</span>
      </Link>
      <nav className={`main-nav ${open ? 'open' : ''}`} aria-label="Navegación principal">
        <Link
          href="/catalogo"
          aria-current={path === '/catalogo' ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          La colección
        </Link>
        <Link href="/sobre-la-tienda" onClick={() => setOpen(false)}>
          Nuestra historia
        </Link>
        <Link href="/contacto" onClick={() => setOpen(false)}>
          Contacto
        </Link>
      </nav>
      <div className="header-actions">
        <Link
          href="/carrito"
          className="bag"
          aria-label={`Carrito, ${items.reduce((s, i) => s + i.quantity, 0)} prendas`}
        >
          <svg width="20" height="23" viewBox="0 0 20 23" fill="none" aria-hidden="true">
            <path d="M2 7h16l1 14H1L2 7Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 8V5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span>Selección ({items.reduce((s, i) => s + i.quantity, 0)})</span>
        </Link>
        <button
          className="menu-button"
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen(!open)}
        >
          {open ? 'Cerrar' : 'Menú'}
        </button>
      </div>
    </header>
  );
}
