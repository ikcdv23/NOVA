# Pedidos y transición a Prisma Migrate: retos 04 a 08

[← Documentación](README.md) · [Mapa de retos](MAPA-RETOS.md) · [Plan completo](RETOS-ECOMMERCE.md)

**Relación con Syncro:** reto 04: estados; 05: modelo; 06: migraciones; 07: repositorio y prueba; 08: cálculo del carrito. Los cambios se prepararon en la rama `define-vocabulary-and-states` y necesitan revisión antes de considerar terminados los retos.

Este trabajo prepara la base para pedidos; todavía no conecta el carrito a un pedido ni gestiona pagos o reservas. Los estados de `docs/ESTADOS-COMPRA.md` son propuestas que deben revisarse con el equipo.

## 1. Punto de partida

NOVA tenía dos migraciones SQL ejecutadas por `scripts/migrate.ts`, registradas en `schema_migrations`. La nueva dirección es usar Prisma Migrate, que guarda las migraciones en `prisma/migrations` y lleva otro historial: `_prisma_migrations`.

## 2. Crear el punto de partida

`prisma/migrations/0_init/migration.sql` reproduce el estado previo, incluyendo las restricciones `CHECK` originales que Prisma no representa en el esquema. También crea la tabla histórica `schema_migrations`: una base nueva no tendrá sus filas antiguas, porque no las necesita para Prisma Migrate. Los archivos originales se conservan como referencia. Este punto inicial es una excepción de transición construido a partir del SQL anterior; las nuevas migraciones se generan desde el esquema con Prisma.

La base existente debe tener **ambas** migraciones antiguas aplicadas y coincidir con ese punto de partida antes de marcarlo como aplicado. `migrate resolve` solo cambia el historial; no comprueba esa equivalencia ni arregla diferencias. Si falta `002` o hay cambios manuales, hay que investigarlos y acordar una transición específica. No borrar ni reiniciar bases con datos para resolver discrepancias.

## 3. Añadir pedidos al esquema

En `prisma/schema.prisma` se añadieron `Order` y `OrderItem`. Un pedido contiene correo, dirección, moneda, subtotal y envío; sus líneas guardan nombre, talla, cantidad y precio unitario como eran al comprar. Si se elimina el producto, `productId` pasa a `null` y la línea conserva esos datos históricos. Los identificadores deben ser UUID proporcionados por el código que cree el pedido.

Los campos `status` y `paymentStatus` comienzan como `PENDING`: son valores provisionales, no una máquina de estados completa. La estructura de dirección usa JSON como propuesta inicial y debe concretarse en el reto de direcciones. Los importes deben validarse y calcularse en el servicio: el repositorio no debe recibir datos sin comprobar desde el navegador.

## 4. Generar y aplicar una migración nueva

Con una base **aislada de desarrollo** y `DATABASE_URL` disponible en el entorno, se ejecutó `npx prisma migrate dev --name add_orders`. Prisma generó y aplicó la migración de `prisma/migrations`. Después se ejecutó `npm run prisma:generate`: en Prisma 7, `migrate dev` no genera el cliente automáticamente.

En una base nueva de pruebas se aplicó `0_init` y después se generó la migración de pedidos. En otra base aislada se ejecutaron los dos SQL antiguos, se marcó `0_init` como aplicado y se aplicó la migración nueva con `migrate deploy`. No se ha hecho la transición en bases de producción o de otros compañeros.

## 5. Repositorio y cálculo

`src/modules/orders/repository/order-repository.ts` ofrece `createOrder` y `findOrder`. Si recibe `tx`, participa en la transacción del servicio; si no, usa `prisma`. Prisma permite crear líneas relacionadas en la misma operación. El repositorio es interno: aún no existe endpoint público ni autorización para consultar pedidos.

`calculateCart` en `src/modules/cart/logic.ts` valida la selección, agrupa líneas por producto y talla, comprueba productos publicados y stock, y calcula con precios de los productos suministrados. El servicio actual obtiene esos productos del servidor. `quoteCart` reutiliza el cálculo y sigue preparando WhatsApp. Esto no reserva ni reduce stock y el coste de envío aún no está implementado.

## 6. Cómo trabajar en adelante

1. Acordad el cambio y modificad `schema.prisma`.
2. En desarrollo aislado, con `DATABASE_URL` configurada, ejecutad `npx prisma migrate dev --name descripcion`.
3. Revisad el SQL generado y comprobad sus efectos sobre datos existentes.
4. Ejecutad `npm run prisma:generate` y las pruebas.
5. Incluid esquema y migración en Git. En una base ya preparada y con su historial correcto, `npx prisma migrate deploy` aplica las migraciones pendientes; no genera otras nuevas.

En Prisma 7, `prisma.config.ts` de NOVA carga `.env` mediante `dotenv/config` y después lee `DATABASE_URL` de `process.env`. Una variable ya definida en el entorno puede tener prioridad sobre la del archivo: comprobad siempre a qué base apunta sin publicar credenciales. La migración inicial de una base real exige copia de seguridad, revisión del esquema y del historial, y comprobaciones por entorno antes de `npx prisma migrate resolve --applied 0_init`. Para bases vacías no se marca: se aplica el historial completo con `migrate deploy`.

**Transición:** los scripts `db:migrate`, `db:migrate:remote` y `railway:migrate` usan ahora `prisma migrate deploy`. La base local fue reiniciada por el usuario y `prisma migrate status` confirmó las dos migraciones aplicadas. No se han modificado bases remotas. Antes de desplegar sobre cualquier base que ya contenga tablas, comprobad su historial y preparad su baseline; no ejecutéis ambos sistemas como si compartieran historial.

## 7. Pruebas

`tests/orders.integration.test.ts` comprueba que pedido y líneas participan en una transacción y que un fallo revierte la escritura. Se activa solo con `NOVA_TEST_DATABASE_URL` definida explícitamente a una base de pruebas; el import `server-only` necesita la condición `react-server`. Ejemplo PowerShell, sustituyendo la dirección por una base local de pruebas propia:

```powershell
$env:NOVA_TEST_DATABASE_URL = '<URL_DE_BASE_DE_PRUEBAS>'
$env:NODE_OPTIONS = '--conditions=react-server'
npx tsx --test tests/orders.integration.test.ts
```

`npm test` ejecuta las pruebas unitarias y omite esta prueba si no se configura esa variable. `npm run typecheck` comprueba los tipos. Antes de considerar completados los retos deben revisarse las decisiones de estados con el equipo y ampliar las pruebas del historial de productos.

## Referencias

- [Prisma 7: baseline de una base existente](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/baselining)
- [Prisma 7: migrate dev](https://www.prisma.io/docs/cli/v7/migrate/dev)
- [Prisma 7: transacciones y escrituras anidadas](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions)
