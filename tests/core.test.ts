import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProducts } from '../src/modules/catalog/demo';
import { filterProducts } from '../src/modules/catalog/filter';
import { cartSchema, quoteCart } from '../src/modules/cart/logic';
import { productSchema, slugifyProductName } from '../src/modules/admin/validation';
import { hashPassword, verifyPassword } from '../src/modules/auth/password';
test('catalog combines collection, size, price, category, condition and availability', () => {
  const found = filterProducts(demoProducts, {
    q: 'oxford',
    collection: 'nueva',
    category: 'Camisas',
    size: 'L',
    min: '44',
    max: '46',
    available: 'true',
    condition: 'Nueva con etiquetas',
  });
  assert.equal(found.length, 1);
  assert.equal(found[0].slug, 'camisa-oxford');
  assert.equal(filterProducts(demoProducts, { size: '34', available: 'true' }).length, 0);
  assert.equal(filterProducts(demoProducts, { q: 'imposible' }).length, 0);
});
test('available filter applies to selected size, hidden items never appear', () => {
  const product = {
    ...demoProducts[0],
    variants: [
      { size: 'M', stock: 0 },
      { size: 'L', stock: 1 },
    ],
  };
  assert.equal(filterProducts([product], { size: 'M', available: 'true' }).length, 0);
  assert.equal(filterProducts([{ ...product, published: false }], {}).length, 0);
});
test('WhatsApp quotes authoritative prices, totals and confirmation without stock mutation', () => {
  const p = structuredClone(demoProducts[1]),
    before = JSON.stringify(p);
  const result = quoteCart(
    [
      { productId: p.id, size: 'M', quantity: 2 },
      { productId: p.id, size: 'L', quantity: 1 },
    ],
    [p],
  );
  assert.equal(result.total, 13500);
  assert.match(result.message, /Talla: M · Cantidad: 2/);
  assert.match(result.message, /disponibilidad/);
  assert.match(result.message, /no reserva/);
  assert.ok(result.url.startsWith('https://wa.me/34695056234?text='));
  assert.equal(new URL(result.url).searchParams.get('text'), result.message);
  assert.equal(JSON.stringify(p), before);
  assert.equal(
    quoteCart([{ productId: p.id, size: 'M', quantity: 1 }], [{ ...p, priceCents: 5000 }]).total,
    5000,
  );
});
test('invalid, deleted, unavailable and duplicate overstock cart lines are rejected', () => {
  const p = demoProducts[0];
  const item = { productId: p.id, size: 'L', quantity: 1 };
  assert.throws(() => quoteCart([item, item], [p]), /solo quedan/);
  assert.throws(() => quoteCart([item], [{ ...p, published: false }]), /disponible/);
  assert.throws(() => quoteCart([{ ...item, size: 'S' }], [p]), /disponible/);
  assert.throws(() => quoteCart([], []), /vacía/);
  assert.equal(cartSchema.safeParse([{ ...item, quantity: -2 }]).success, false);
  assert.equal(cartSchema.safeParse([{ ...item, quantity: 1.5 }]).success, false);
});
const valid = {
  name: 'Camisa Oxford',
  slug: 'camisa-oxford',
  collection: 'nueva',
  category: 'Camisas',
  price: '45,99',
  description: 'Camisa de algodón suave',
  measurements: 'Pecho: 55 cm',
  condition: 'Nueva con etiquetas',
  published: false,
  featured: false,
  variants: [{ size: 'M', stock: 3 }],
};
test('product validation converts decimal currency exactly and rejects bad inventory', () => {
  assert.equal(productSchema.parse(valid).price, 4599);
  for (const changed of [
    { price: '-1' },
    { price: '1.234' },
    { slug: '../admin' },
    { variants: [{ size: 'M', stock: -1 }] },
    {
      variants: [
        { size: 'M', stock: 1 },
        { size: 'm', stock: 1 },
      ],
    },
    { variants: [] },
  ])
    assert.equal(productSchema.safeParse({ ...valid, ...changed }).success, false);
});
test('product names become safe, readable slugs without technical input', () => {
  assert.equal(slugifyProductName('  Chaqueta Cazadora Años 90  '), 'chaqueta-cazadora-anos-90');
  assert.equal(slugifyProductName('Camisa / Sobrecamisa'), 'camisa-sobrecamisa');
});
test('password hashes are salted and reject incorrect passwords', async () => {
  const password = 'sample-password-for-tests';
  const a = await hashPassword(password),
    b = await hashPassword(password);
  assert.notEqual(a, b);
  assert.equal(await verifyPassword(password, a), true);
  assert.equal(await verifyPassword('wrong', a), false);
  assert.equal(await verifyPassword(password, 'malformed'), false);
});
