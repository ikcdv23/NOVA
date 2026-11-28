import 'server-only';
import { z } from 'zod';
import { requireAdmin } from '@/modules/auth/session';
import * as repository from '../repository/order-repository';

// Las pantallas del panel consultan este servicio después de verificar la sesión.
export async function listAdminOrders() {
  await requireAdmin();
  return repository.listOrders();
}

export async function getAdminOrder(id: string) {
  await requireAdmin();
  if (!z.uuid().safeParse(id).success) return null;
  return repository.findOrder(id);
}
