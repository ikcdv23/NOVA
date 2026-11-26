import { notFound } from 'next/navigation';
import { getProduct } from '@/modules/catalog/service/catalog-service';
import { ProductDetail } from '@/components/catalog/product-detail';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await params).slug);
  return { title: p?.name ?? 'Prenda no encontrada', description: p?.description };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  return (
    <div className="page-wrap">
      <ProductDetail product={p} />
    </div>
  );
}
