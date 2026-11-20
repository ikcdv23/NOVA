# Comprobaciones locales

`pnpm test` verifica filtros combinados, disponibilidad por talla, prendas ocultas, importes y mensaje WhatsApp, rechazo de cantidades inválidas, stock duplicado, validación de producto y hashes de contraseña.

`pnpm typecheck` comprueba TypeScript. `pnpm build` crea la aplicación de producción.

## Recorridos de navegador con servicios aislados

Las pruebas de Playwright usan exclusivamente una base local de pruebas en el puerto 55439. No apuntan a `DATABASE_URL` de producción. El simulador S3 prueba el protocolo y las acciones de la app, pero no sustituye una comprobación de credenciales contra el proveedor real.

En tres terminales:

1. `pnpm exec tsx scripts/qa-database.ts`: PostgreSQL temporal en `.qa/postgres`, credenciales solo locales `nova_qa / local_qa_only`, base `nova_qa`.
2. `node tests/fixtures/s3-server.mjs`: simulador S3 en 9000. Detén MinIO si ocupa ese puerto.
3. Configura las variables de la aplicación de pruebas según el bloque siguiente y ejecuta `pnpm start -- --port 3001` después de compilar. También sirve `pnpm dev -- --port 3001`; no compiles ni modifiques archivos mientras corres las pruebas.

Antes de iniciar la app, en la tercera terminal PowerShell:

```powershell
$env:DATABASE_URL='postgresql://nova_qa:local_qa_only@127.0.0.1:55439/nova_qa'
$env:DEMO_MODE='false'
pnpm exec tsx scripts/migrate.ts
pnpm exec tsx scripts/seed.ts
$env:ADMIN_EMAIL='admin@nova.test'
$env:ADMIN_PASSWORD='NOVA-local-test-only-284!'
pnpm exec tsx scripts/create-admin.ts
Remove-Item Env:ADMIN_PASSWORD
pnpm start -- --port 3001
```

El correo y la contraseña anteriores pertenecen exclusivamente al banco de pruebas. El comando de alta rechazará la segunda ejecución porque el usuario ya existe. Las variables S3 locales de `.env.example` sirven para el simulador.

En una cuarta terminal, ejecuta `pnpm test:e2e`. Windows usa Edge; puedes elegir `QA_BROWSER=chrome` o `chromium`. En Linux se requiere instalar Chromium de Playwright (`pnpm exec playwright install chromium`).

Los recorridos comprueban navegación y filtros, selección de talla, persistencia del carrito, mensaje WhatsApp interceptado sin enviarlo, stock sin cambios, menú móvil y desbordamiento horizontal, redirección de rutas privadas, login, cookie, creación/edición/ocultación/eliminación de prendas, rechazo de archivos inválidos, cinco fotografías, principal, actualización pública, bloqueo de acciones sin sesión, rechazo de origen ajeno y logout. Las trazas de fallos quedan en `test-results`, excluido del repositorio.

Los servicios se detienen con Ctrl+C. `.qa` no se publica ni se versiona. Para desplegar, configura tus propios PostgreSQL, bucket y administrador siguiendo el README.
