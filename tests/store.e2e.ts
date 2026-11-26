import { test, expect, type Request } from '@playwright/test';
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: 'postgresql://nova_qa:local_qa_only@127.0.0.1:55439/nova_qa',
});
test.afterAll(async () => pool.end());
test('public filters, product sizes, persistent cart and WhatsApp quote', async ({ page }) => {
  await page.goto('/catalogo?collection=nueva&size=L&category=Camisas&q=Oxford');
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.getByRole('heading', { name: 'Camisa Oxford', exact: true }).click();
  await page.getByRole('button', { name: 'M', exact: true }).click();
  await page.getByRole('button', { name: /Añadir a mi selección/ }).click();
  await page.getByRole('link', { name: /Ver mi selección/ }).click();
  await expect(page.locator('.cart-line')).toHaveCount(1);
  await page.getByRole('button', { name: /Aumentar cantidad/ }).click();
  await expect(page.locator('.summary-total strong')).toContainText('90,00');
  await page.reload();
  await expect(page.locator('.quantity span')).toHaveText('2');
  const before = await pool.query('SELECT stock FROM variants WHERE product_id=$1 AND size=$2', [
    '00000000-0000-4000-8000-000000000002',
    'M',
  ]);
  let whatsApp = '';
  await page.route('https://wa.me/**', async (route) => {
    whatsApp = route.request().url();
    await route.fulfill({ body: 'WhatsApp intercepted for test' });
  });
  await page.getByRole('button', { name: /Solicitar por WhatsApp/ }).click();
  await expect.poll(() => whatsApp).toContain('34695056234');
  const message = new URL(whatsApp).searchParams.get('text')!;
  expect(message).toContain('Talla: M · Cantidad: 2');
  expect(message).toContain('90,00');
  expect(message).toContain('confirmarme la disponibilidad');
  const after = await pool.query('SELECT stock FROM variants WHERE product_id=$1 AND size=$2', [
    '00000000-0000-4000-8000-000000000002',
    'M',
  ]);
  expect(after.rows).toEqual(before.rows);
});
test('mobile menu and no horizontal overflow on public routes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('link', { name: 'La colección', exact: true }).click();
  await expect(page).toHaveURL(/catalogo/);
  for (const route of [
    '/',
    '/catalogo',
    '/producto/bomber-piel',
    '/carrito',
    '/contacto',
    '/sobre-la-tienda',
  ]) {
    await page.goto(route);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      route,
    ).toBe(true);
  }
});
test('protected admin CRUD, images, visibility, direct action denial and logout', async ({
  page,
  browser,
}) => {
  await page.goto('/admin/prendas/nueva');
  await expect(page).toHaveURL(/admin\/login/);
  await page.getByLabel('Correo electrónico').fill('admin@nova.test');
  await page.getByLabel('Contraseña').fill('NOVA-local-test-only-284!');
  await page.getByRole('button', { name: /Entrar al panel/ }).click();
  await expect(page.getByRole('heading', { name: 'El inventario' })).toBeVisible();
  const cookies = await page.context().cookies();
  const session = cookies.find((c) => c.name === 'nova_session')!;
  expect(session.httpOnly).toBe(true);
  expect(session.sameSite).toBe('Lax');
  await page.screenshot({ path: '.qa/admin-desktop.png', fullPage: true });
  await page.getByRole('link', { name: /Añadir prenda/ }).click();
  const stamp = Date.now();
  const slug = `chaqueta-qa-${stamp}`;
  const productName = `Chaqueta QA ${stamp}`;
  await page.getByLabel(/^Nombre/).fill(productName);
  await expect(page.getByLabel(/^Personalizar dirección/)).toHaveValue(slug);
  await page.getByLabel(/^Precio/).fill('39,90');
  await page
    .getByLabel(/^Descripción/)
    .fill('Chaqueta de prueba para verificar el inventario completo.');
  await page.getByLabel(/^Medidas/).fill('Pecho 54 cm · Largo 70 cm');
  await page.getByLabel(/^Unidades/).fill('3');
  await page.getByLabel(/^Fotografías/).setInputFiles('public/images/shirt.png');
  await expect(page.getByText('1 foto seleccionada', { exact: false })).toBeVisible();
  await page.getByLabel('Publicar al guardar', { exact: false }).check();
  await page.getByRole('button', { name: 'Guardar prenda', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Editar prenda' })).toBeVisible();
  const id = page.url().split('/').at(-1)!;
  const anon = await browser.newContext({ baseURL: process.env.QA_URL ?? 'http://localhost:3001' });
  const publicPage = await anon.newPage();
  await publicPage.goto(`/producto/${slug}`);
  await expect(publicPage.getByRole('heading', { name: productName })).toBeVisible();
  await expect(publicPage.locator('.gallery-main img')).toBeVisible();
  await page
    .getByLabel('Subir una foto')
    .setInputFiles({ name: 'bad.png', mimeType: 'image/png', buffer: Buffer.from('not-an-image') });
  await page.getByRole('button', { name: /Subir foto/ }).click();
  await expect(page.locator('.photo-manager [role="alert"]')).toContainText(
    'No se ha podido leer',
  );
  for (let i = 1; i < 5; i++) {
    await page.getByLabel('Subir una foto').setInputFiles('public/images/shirt.png');
    await page.getByRole('button', { name: /Subir foto/ }).click();
    await expect(page.getByRole('heading', { name: `Fotografías (${i + 1}/5)` })).toBeVisible();
  }
  await expect(page.getByLabel('Subir una foto')).toHaveCount(0);
  await page.getByRole('button', { name: 'Hacer principal' }).last().click();
  await expect(page.getByText('Imagen principal actualizada.')).toBeVisible();
  await page.getByLabel(/^Precio/).fill('42,50');
  await page.getByRole('button', { name: /Guardar cambios/ }).click();
  await expect(page.getByText('Prenda guardada. El catálogo ya está actualizado.')).toBeVisible();
  await publicPage.reload();
  await expect(publicPage.locator('.detail-price')).toContainText('42,50');
  await page.getByRole('link', { name: '← Inventario', exact: true }).click();
  const row = page.getByRole('row').filter({ hasText: productName });
  let captured: Request | undefined;
  page.on('request', (r) => {
    if (r.method() === 'POST' && r.headers()['next-action']) captured = r;
  });
  await row.getByRole('button', { name: 'Ocultar', exact: true }).click();
  await expect(row.getByRole('cell', { name: 'Oculta', exact: true })).toBeVisible();
  await publicPage.goto(`/producto/${slug}`);
  await expect(publicPage.getByRole('heading', { name: 'No está disponible' })).toBeVisible();
  // Replay a real mutation without authentication, even though its action ID is known.
  expect(captured).toBeDefined();
  const req = captured!;
  await row.getByRole('button', { name: 'Publicar', exact: true }).click();
  await expect(row.getByRole('cell', { name: 'Publicada', exact: true })).toBeVisible();
  const headers = { ...req.headers() };
  delete headers.cookie;
  delete headers.host;
  delete headers['content-length'];
  await anon.request.post(req.url(), { headers, data: req.postDataBuffer()!, maxRedirects: 0 });
  expect(
    (await pool.query('SELECT published FROM products WHERE id=$1', [id])).rows[0].published,
  ).toBe(true);
  // Forge a cross-origin mutation using an authenticated request. Next must reject it.
  const csrf = await page.request.post(req.url(), {
    headers: { ...headers, origin: 'https://untrusted.example' },
    data: req.postDataBuffer()!,
    maxRedirects: 0,
  });
  expect(csrf.status()).toBeGreaterThanOrEqual(400);
  await row.getByRole('button', { name: 'Eliminar', exact: true }).click();
  await row.getByRole('button', { name: 'Sí, eliminar', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: productName })).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpiar archivos pendientes' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'archivos pendientes' })).toContainText(
    '5 archivos',
  );
  expect((await pool.query('SELECT id FROM products WHERE id=$1', [id])).rowCount).toBe(0);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/admin\/login/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/admin\/login/);
  await anon.close();
});
