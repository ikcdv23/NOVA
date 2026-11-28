import 'server-only';
import type { Prisma } from '@/generated/prisma-client/client';
import type { OrderStatus } from '@/generated/prisma-client/enums';
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

// Lista resumida para el panel; no incluye dirección ni correo del comprador.
export function listOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, createdAt: true, status: true, paymentStatus: true, totalCents: true, currency: true },
  });
}

export function changeStatus(id: string, status: OrderStatus, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  return client.order.update({
    where: { id },
    data: { status },
  });
}
