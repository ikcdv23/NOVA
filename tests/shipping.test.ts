import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateShipping, type ShippingRate } from '../src/modules/shipping/rates';

const rates: ShippingRate[] = [
  { zone: 'Zona A (prueba)', country: 'ES', postalPrefixes: ['28'], priceCents: 500, approved: true },
  { zone: 'Zona B (prueba)', country: 'ES', postalPrefixes: ['35'], priceCents: 800, approved: false },
  { zone: 'Otro país (prueba)', country: 'FR', postalPrefixes: [], priceCents: 1000, approved: true },
];

test('calcula importes ficticios para una zona aprobada y no inventa tarifas', () => {
  assert.deepEqual(calculateShipping({ country: 'es', postalCode: '28001' }, rates), { zone: 'Zona A (prueba)', priceCents: 500 });
  assert.deepEqual(calculateShipping({ country: 'FR', postalCode: '75001' }, rates), { zone: 'Otro país (prueba)', priceCents: 1000 });
  assert.equal(calculateShipping({ country: 'ES', postalCode: '35001' }, rates), null);
  assert.equal(calculateShipping({ country: 'PT', postalCode: '1000' }, rates), null);
  assert.equal(calculateShipping({ country: 'ES', postalCode: '' }, rates), null);
});

test('rechaza tarifas ambiguas o inválidas', () => {
  const destination = { country: 'ES', postalCode: '28001' };
  assert.equal(calculateShipping(destination, [rates[0], { ...rates[0], zone: 'Solapada' }]), null);
  assert.equal(calculateShipping(destination, [{ ...rates[0], priceCents: -1 }]), null);
});
