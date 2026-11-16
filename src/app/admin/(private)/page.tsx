import { requireAdmin } from '@/modules/auth/session';
import { getAdminProducts } from '@/modules/catalog/repository';
import { Inventory } from '@/modules/admin/inventory';
export default async function Admin() {
  await requireAdmin();
  return <Inventory products={await getAdminProducts()} />;
}
