'use client';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { cartSchema, type CartItem } from './logic';
type CartContextType = {
  items: CartItem[];
  ready: boolean;
  add: (id: string, size: string, stock: number) => void;
  update: (id: string, size: string, quantity: number) => void;
  remove: (id: string, size: string) => void;
  notice: string;
};
const CartContext = createContext<CartContextType | null>(null);
const storageKey = 'nova-archive-cart-v1';
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]),
    [ready, setReady] = useState(false),
    [notice, setNotice] = useState('');
  useEffect(() => {
    try {
      const parsed = cartSchema.safeParse(JSON.parse(localStorage.getItem(storageKey) ?? '[]'));
      if (parsed.success) setItems(parsed.data);
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {}
  }, [items, ready]);
  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(''), 3500);
      return () => clearTimeout(t);
    }
  }, [notice]);
  const add = (productId: string, size: string, stock: number) => {
    if (stock < 1) return;
    const existing = items.find((i) => i.productId === productId && i.size === size);
    if (existing && existing.quantity >= Math.min(stock, 99)) {
      setNotice('Ya tienes todas las unidades disponibles de esta talla.');
      return;
    }
    if (!existing && items.length >= 50) {
      setNotice('La selección admite un máximo de 50 prendas.');
      return;
    }
    setItems((prev) => {
      const row = prev.find((i) => i.productId === productId && i.size === size);
      return row
        ? prev.map((i) => (i === row ? { ...i, quantity: Math.min(i.quantity + 1, stock, 99) } : i))
        : [...prev, { productId, size, quantity: 1 }];
    });
    setNotice('Prenda añadida a tu selección.');
  };
  const remove = (id: string, size: string) =>
    setItems((prev) => prev.filter((i) => !(i.productId === id && i.size === size)));
  const update = (id: string, size: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    setItems((prev) =>
      prev.map((i) => (i.productId === id && i.size === size ? { ...i, quantity } : i)),
    );
  };
  return (
    <CartContext.Provider value={{ items, ready, add, update, remove, notice }}>
      {children}
      <div className={`toast ${notice ? 'visible' : ''}`} role="status">
        {notice}
      </div>
    </CartContext.Provider>
  );
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('CartProvider missing');
  return context;
}
