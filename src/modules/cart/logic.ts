import { z } from 'zod';
import { money, store } from '@/config/store';
import type { Product } from '@/modules/catalog/types';
export const cartSchema = z
  .array(
    z.object({
      productId: z.uuid(),
      size: z.string().min(1).max(20),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .max(50);
export type CartItem = z.infer<typeof cartSchema>[number];
export function quoteCart(items: CartItem[], products: Product[]) {
  const merged = new Map<string, CartItem>();
  for (const item of items) {
    const key = `${item.productId}:${item.size}`;
    merged.set(key, { ...item, quantity: item.quantity + (merged.get(key)?.quantity ?? 0) });
  }
  if (!merged.size) throw new Error('Tu selección está vacía.');
  const lines = [...merged.values()].map((item) => {
    const product = products.find((p) => p.id === item.productId && p.published);
    const variant = product?.variants.find((v) => v.size === item.size);
    if (!product || !variant)
      throw new Error('Una prenda ya no está disponible. Retírala de tu selección.');
    if (item.quantity > variant.stock)
      throw new Error(
        `${product.name}, talla ${item.size}: solo quedan ${variant.stock} unidades. Actualiza la cantidad.`,
      );
    return {
      ...item,
      name: product.name,
      slug: product.slug,
      priceCents: product.priceCents,
      subtotal: product.priceCents * item.quantity,
    };
  });
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  const message = [
    `Hola, ${store.name}. Me interesan estas prendas:`,
    '',
    ...lines.map(
      (l) =>
        `• ${l.name} (${l.slug})\n  Talla: ${l.size} · Cantidad: ${l.quantity}\n  Precio unitario: ${money(l.priceCents)} · Subtotal: ${money(l.subtotal)}`,
    ),
    '',
    `Total de prendas: ${money(total)}`,
    '',
    '¿Podéis confirmarme la disponibilidad y el importe final, incluidos los gastos de envío si corresponden? Entiendo que esta solicitud no reserva las prendas.',
  ].join('\n');
  return {
    lines,
    total,
    message,
    url: `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`,
  };
}
