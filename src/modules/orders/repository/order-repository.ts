import 'server-only';
import type { Prisma } from '@/generated/prisma-client/client';
import { prisma } from '@/lib/prisma';

// El servicio debe calcular y validar los importes antes de llamar al repositorio.
export function createOrder(data: Prisma.OrderCreateInput, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.order.create({ data, include: { items: true } });
}

export function findOrder(id: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.order.findUnique({ where: { id }, include: { items: true } });
}
