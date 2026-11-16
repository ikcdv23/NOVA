import { getPublicProducts } from '@/modules/catalog/repository';
import { CartPage } from '@/modules/cart/cart-page';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tu selección' };
export default async function Cart() {
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <h1>Tu selección</h1>
        <p>Un buen comienzo para tu próxima historia.</p>
      </div>
      <CartPage products={await getPublicProducts()} />
    </div>
  );
}
