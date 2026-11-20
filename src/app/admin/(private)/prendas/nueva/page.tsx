import { requireAdmin } from '@/modules/auth/session';
import { ProductForm } from '@/components/admin/product-form';
export default async function NewProduct() {
  await requireAdmin();
  return <ProductForm />;
}
