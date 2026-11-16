# Verificación de la entrega

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
