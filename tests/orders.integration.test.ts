import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Solo se ejecuta con una base de pruebas indicada explícitamente.
test('el pedido y sus líneas se guardan juntos o se revierten', { skip: !process.env.NOVA_TEST_DATABASE_URL }, async () => {
  process.env.DATABASE_URL = process.env.NOVA_TEST_DATABASE_URL;
  const { prisma } = await import('../src/lib/prisma');
  const { createOrder, findOrder } = await import('../src/modules/orders/repository/order-repository');
  const orderId = randomUUID();
  const itemId = randomUUID();
  const data = {
    id: orderId, email: 'test@example.test', shippingName: 'Prueba',
    shippingAddress: { country: 'ES' }, subtotalCents: 1000, shippingCents: 200, totalCents: 1200,
    items: { create: [{ id: itemId, productName: 'Chaqueta', size: 'M', quantity: 1, unitPriceCents: 1000 }] },
  };
  try {
    await assert.rejects(prisma.$transaction(async tx => {
      await createOrder(data, tx);
      const saved = await findOrder(orderId, tx);
      assert.equal(saved?.items[0].productName, 'Chaqueta');
      throw new Error('revertir prueba');
    }), /revertir prueba/);
    assert.equal(await findOrder(orderId), null);
    await assert.rejects(createOrder({ ...data, items: { create: [data.items.create[0], data.items.create[0]] } }));
    assert.equal(await findOrder(orderId), null);
  } finally {
    await prisma.$disconnect();
  }
});
