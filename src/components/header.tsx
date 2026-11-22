'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import { useCart } from '@/modules/cart/provider';
import { store } from '@/config/store';
import { Wordmark } from '@/components/brand/wordmark';

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const { items } = useCart();
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header
      className="site-header"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <button
        ref={menuButton}
        className="menu-button"
        aria-expanded={open}
        aria-controls="main-navigation"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true">{open ? '−' : '+'}</span> {open ? 'Cerrar' : 'Menú'}
      </button>
      <nav
        id="main-navigation"
        className={`main-nav ${open ? 'open' : ''}`}
        aria-label="Navegación principal"
      >
        <Link
          href="/catalogo"
          aria-current={path === '/catalogo' ? 'page' : undefined}
          onClick={() => setOpen(false)}
        >
          La colección
        </Link>
        <Link href="/catalogo?collection=nueva" onClick={() => setOpen(false)}>
          Ropa nueva
        </Link>
        <Link href="/catalogo?collection=vintage" onClick={() => setOpen(false)}>
          Vintage
        </Link>
        <Link className="nav-mobile-only" href="/sobre-la-tienda" onClick={() => setOpen(false)}>
          {store.name}
        </Link>
        <Link className="nav-mobile-only" href="/contacto" onClick={() => setOpen(false)}>
          Contacto
        </Link>
      </nav>
      <Link
        className="wordmark"
        href="/"
        aria-label={`${store.name}, inicio`}
        onClick={() => setOpen(false)}
      >
        <Wordmark />
      </Link>
      <div className="header-actions">
        <Link className="header-contact" href="/contacto">
          Hablemos
        </Link>
        <Link
          href="/carrito"
          className="bag"
          aria-label={`Carrito, ${quantity} prendas`}
          onClick={() => setOpen(false)}
        >
          <svg width="19" height="23" viewBox="0 0 20 23" fill="none" aria-hidden="true">
            <path d="M2 7h16l1 14H1L2 7Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M6 8V5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.4" />
          </svg>
          <span className="bag-label">Selección</span> <span>({quantity})</span>
        </Link>
      </div>
    </header>
  );
}
