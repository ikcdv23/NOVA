'use server';
import { getPublicProducts } from '@/modules/catalog/repository';
import { cartSchema, quoteCart } from './logic';
export async function prepareWhatsApp(input: unknown): Promise<{ url?: string; error?: string }> {
  const parsed = cartSchema.safeParse(input);
  if (!parsed.success) return { error: 'La selección no es válida. Revisa las cantidades.' };
  try {
    return { url: quoteCart(parsed.data, await getPublicProducts()).url };
  } catch (error) {
    return {
      error:
        error instanceof Error && !('code' in error)
          ? error.message
          : 'No se ha podido comprobar la disponibilidad. Inténtalo de nuevo.',
    };
  }
}
