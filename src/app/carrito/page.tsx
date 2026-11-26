import { getPublicProducts } from '@/modules/catalog/service/catalog-service';
import { CartPage } from '@/components/cart/cart-page';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Tu selección' };
export default async function Cart() {
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <h1>Tu selección</h1>
        <p>Revisa las tallas y consulta la disponibilidad antes de comprar.</p>
      </div>
      <CartPage products={await getPublicProducts()} />
    </div>
  );
}
