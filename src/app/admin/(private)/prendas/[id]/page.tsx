import { notFound } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/session';
import { getAdminProduct } from '@/modules/catalog/repository';
import { ProductForm } from '@/modules/admin/product-form';
import { idSchema } from '@/modules/admin/validation';
export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const product = await getAdminProduct(id);
  if (!product) notFound();
  return <ProductForm product={product} />;
}
