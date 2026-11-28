import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCheckoutDetails } from '../src/modules/orders/checkout-validation';

const data = { email: ' CLIENTE@example.test ', name: 'Ana', address: 'Calle Mayor 1', city: 'Madrid', postalCode: '28001', country: 'es' };

test('valida y normaliza los datos mínimos de envío', () => {
  const result = validateCheckoutDetails(data, ['ES']);
  assert.equal(result.success, true);
  if (result.success) assert.equal(result.data.email, 'cliente@example.test');
});

test('rechaza países no habilitados y datos obligatorios inválidos', () => {
  assert.equal(validateCheckoutDetails(data, []).success, false);
  assert.equal(validateCheckoutDetails({ ...data, email: 'incorrecto' }, ['ES']).success, false);
  assert.equal(validateCheckoutDetails({ ...data, address: '  ' }, ['ES']).success, false);
});
