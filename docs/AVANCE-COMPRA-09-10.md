# Compra: avances de los retos 08, 09 y 10

## 08 · Importes del carrito

El servidor calcula los importes a partir de los productos que recibe de la base de datos; no utiliza precios enviados por el navegador. La prueba `tests/core.test.ts` comprueba que se ignoran los precios manipulados y se suman productos diferentes. También hay pruebas de productos ocultos, tallas y cantidades.

## 09 · Datos del comprador

`src/modules/orders/checkout-validation.ts` prepara la validación del correo y de los datos básicos de envío. El servidor debe facilitar la lista de países permitidos. La validación **todavía no está conectada a un formulario ni al proceso de compra**. La disponibilidad del país no sustituye la comprobación de la tarifa concreta para su código postal.

## 10 · Tarifas de envío

`src/modules/shipping/rates.ts` calcula una tarifa a partir de reglas recibidas. Cada regla contiene país, zona, prefijos postales opcionales, precio en céntimos y aprobación. Si no hay ninguna coincidencia aprobada, o hay dos, devuelve `null`: quien integre la función debe impedir el pago en ese caso. Las cifras de `tests/shipping.test.ts` son ficticias.

**Pendiente:** guardar las tarifas y editarlas en el panel de administración; definir las zonas y precios reales con el cliente; conectar la validación y el cálculo al pedido; conservar en este la zona y el importe aplicados. El cálculo por peso no está implementado. El checkout actual no usa estas reglas, por lo que esta preparación no habilita una venta real.

## Cuenta del comprador

Se ha acordado correo y contraseña, con una cuenta separada del administrador. Falta implementar el registro, el acceso, la recuperación y verificación del correo, y la relación segura con sus pedidos. También hay que elegir un proveedor de correo antes de probar el envío de enlaces reales.
