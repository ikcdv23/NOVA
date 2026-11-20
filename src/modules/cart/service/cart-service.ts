import 'server-only';
import { getPublicProducts } from '@/modules/catalog/service/catalog-service';
import { quoteCart, type CartItem } from '../logic';

export async function prepareQuote(items: CartItem[]) {
  return quoteCart(items, await getPublicProducts());
}
