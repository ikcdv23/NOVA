# Verificación de la entrega

## Configuración de Vercel y entornos — 21 de noviembre de 2026

Se vinculó `nova` con `neon-coral-engine`, se aplicó `001_initial.sql` y se volvió a desplegar la versión de `main` que ya estaba publicada. El healthcheck autenticado devolvió `{"status":"ok","mode":"live"}`. Esto no valida la subida de fotografías: AWS está instalado en la cuenta, pero no se encontró un bucket S3 vinculado ni variables S3 para NOVA. Tampoco se ha ejecutado el seed ni el alta de administrador sobre producción.

Comprobaciones de la reorganización del repositorio:

- `npm ci` completado con `package-lock.json` y generación de Prisma Client 7.10.1.
- `npm test`: 7/7 correctas; `npm run typecheck` y `npm run build`: correctos.
- Next.js carga únicamente `.env` en local, en modo demo. Las descargas de Development, Preview y Production se comprobaron en `.vercel/` y están excluidas de Git.
- Inicio de la compilación local con `npm start -- --port 3047`: healthcheck `200` con `{"status":"ok","mode":"demo"}`; inicio, catálogo y ficha de ejemplo responden `200`. El proceso de comprobación se detuvo al terminar.
- Las configuraciones locales anteriores se conservaron en `.vercel/env-backups/` antes de restablecer `.env` desde la plantilla local.
- `npm audit --omit=dev` señala tres entradas de severidad alta en la cadena `prisma` → `@prisma/config` → `effect`, por un aviso de ReDoS de `effect`. La corrección automática propuesta baja Prisma a 6.12.0 y supone un cambio mayor; no se aplicó. Queda pendiente revisar una actualización compatible de esa cadena.

La configuración actual y sus limitaciones, incluida Vercel Authentication, están en [VERCEL.md](VERCEL.md). Las comprobaciones siguientes son el registro histórico de la entrega inicial.

## Entrega inicial — 14 de noviembre de 2026

Comprobado el 14 de noviembre de 2026.

- Compilación de producción: correcta, Next.js 16.4.6 con Webpack.
- TypeScript: sin errores.
- Pruebas de lógica: 6/6 correctas (filtros, stock por talla, WhatsApp, importes, validación y contraseñas).
- Recorridos Playwright en Edge: catálogo y carrito correctos; navegación móvil y ausencia de desbordamiento correctos; recorrido completo de administración correcto sobre producción.
- PostgreSQL real local: migración, seed, alta de administrador, sesiones, cambios de stock y CRUD comprobados.
- S3: probado con el SDK real contra un simulador HTTP local. Subida y recodificación, límite visible de cinco fotos, principal, publicación, borrado y limpieza completados. Falta validar las credenciales y el endpoint del bucket definitivo.
- Seguridad comprobada en navegador: rutas privadas redirigen al login; una acción capturada y repetida sin cookie no modifica el producto; una petición autenticada con origen ajeno es rechazada; logout invalida el acceso.
- WhatsApp interceptado durante las pruebas: teléfono y contenido correctos, precios recalculados y stock intacto. No se envió ningún mensaje.
- Inspector visual sobre producción a 1440, 768 y 390 px: 0 fallos. Capturas revisadas. Los cinco avisos de estilo y la valoración 7,4/10 están explicados en `DESIGN.md`.

La prueba en producción detectó dos versiones nativas de Sharp cargadas simultáneamente. Se unificó la app con la versión 0.35.5 de Next y se repitió satisfactoriamente el recorrido completo de administración.

No se ha desplegado en Railway ni se han creado recursos externos. El despliegue requiere la cuenta del propietario, PostgreSQL, un bucket y las variables reales del README. El modo demo queda configurado localmente para poder explorar la plantilla sin servicios.
