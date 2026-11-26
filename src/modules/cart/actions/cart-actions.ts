'use server';
import { cartSchema } from '../logic';
import { prepareQuote } from '../service/cart-service';

export async function prepareWhatsApp(input: unknown): Promise<{ url?: string; error?: string }> {
  const parsed = cartSchema.safeParse(input);
  if (!parsed.success) return { error: 'La selección no es válida. Revisa las cantidades.' };
  try {
    return { url: (await prepareQuote(parsed.data)).url };
  } catch (error) {
    return {
      error:
        error instanceof Error && !('code' in error)
          ? error.message
          : 'No se ha podido comprobar la disponibilidad. Inténtalo de nuevo.',
    };
  }
}
