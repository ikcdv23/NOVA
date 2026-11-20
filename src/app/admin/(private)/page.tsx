import { requireAdmin } from '@/modules/auth/session';
import { getAdminProducts } from '@/modules/catalog/service/catalog-service';
import { Inventory } from '@/components/admin/inventory';
export default async function Admin() {
  await requireAdmin();
  return <Inventory products={await getAdminProducts()} />;
}
