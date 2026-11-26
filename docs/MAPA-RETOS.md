# Mapa de retos de Syncro

[← Índice de documentación](README.md) · [Ver los 32 retos completos](RETOS-ECOMMERCE.md)

Los números y títulos identifican las tareas creadas en el proyecto NOVA de Syncro. Este mapa indica documentación relevante, no certifica que cada reto esté terminado. Los retos que todavía no tienen guía específica se apoyan en su descripción y referencias del plan.

## Descubrir y diseñar

| Reto de Syncro | Documentación para empezar |
| --- | --- |
| 01 · Entrevistar al cliente y acotar la primera versión | [Reto 01](RETOS-ECOMMERCE.md#01-entrevistar-al-cliente-y-acotar-la-primera-versión) y preguntas pendientes en el [plan](RETOS-ECOMMERCE.md) |
| 02 · Dibujar el recorrido completo de una compra | [Reto 02](RETOS-ECOMMERCE.md#02-dibujar-el-recorrido-completo-de-una-compra) y [estados de una compra](ESTADOS-COMPRA.md) |
| 03 · Investigar el carrito que ya existe | [Reto 03](RETOS-ECOMMERCE.md#03-investigar-el-carrito-que-ya-existe), [arquitectura](../README.md#arquitectura) y [cálculo actual](PEDIDOS-PRISMA-PASO-A-PASO.md#5-repositorio-y-cálculo) |
| 04 · Definir vocabulario y estados | [Estados de una compra](ESTADOS-COMPRA.md) y [reto 04](RETOS-ECOMMERCE.md#04-definir-vocabulario-y-estados) |
| 05 · Diseñar los datos del pedido | [Modelo de pedidos](PEDIDOS-PRISMA-PASO-A-PASO.md#3-añadir-pedidos-al-esquema) y [reto 05](RETOS-ECOMMERCE.md#05-diseñar-los-datos-del-pedido) |

## Base de datos y carrito

| Reto de Syncro | Documentación para empezar |
| --- | --- |
| 06 · Preparar la migración de pedidos | [Transición y baseline](PEDIDOS-PRISMA-PASO-A-PASO.md#2-crear-el-punto-de-partida), [migración nueva](PEDIDOS-PRISMA-PASO-A-PASO.md#4-generar-y-aplicar-una-migración-nueva) y [teoría](MIGRACIONES.md) |
| 07 · Implementar repositorio de pedidos | [Repositorio y cálculo](PEDIDOS-PRISMA-PASO-A-PASO.md#5-repositorio-y-cálculo) y [transacciones](PRISMA-REFERENCIA.md#transacciones) |
| 08 · Calcular importes en el servidor | [Repositorio y cálculo](PEDIDOS-PRISMA-PASO-A-PASO.md#5-repositorio-y-cálculo) y [reto 08](RETOS-ECOMMERCE.md#08-calcular-importes-en-el-servidor) |
| 09 · Recoger datos de contacto y dirección | [Reto 09](RETOS-ECOMMERCE.md#09-recoger-datos-de-contacto-y-dirección) y [seguridad](RETOS-ECOMMERCE.md#25-revisar-seguridad-y-privacidad) |
| 10 · Diseñar las tarifas de envío | [Reto 10](RETOS-ECOMMERCE.md#10-diseñar-las-tarifas-de-envío) y [configuración de tarifas](RETOS-ECOMMERCE.md#28-editar-zonas-y-tarifas-en-el-panel) |
| 11 · Crear un pedido pendiente desde el carrito | [Reto 11](RETOS-ECOMMERCE.md#11-crear-un-pedido-pendiente-desde-el-carrito) y [modelo de pedidos](PEDIDOS-PRISMA-PASO-A-PASO.md#3-añadir-pedidos-al-esquema) |
| 12 · Diseñar reservas por talla | [Reto 12](RETOS-ECOMMERCE.md#12-diseñar-reservas-por-talla) y [estados de compra](ESTADOS-COMPRA.md) |
| 13 · Implementar y probar reserva concurrente | [Reto 13](RETOS-ECOMMERCE.md#13-implementar-y-probar-reserva-concurrente) y [transacciones](PRISMA-REFERENCIA.md#transacciones) |
| 14 · Caducidad y liberación de reservas | [Reto 14](RETOS-ECOMMERCE.md#14-caducidad-y-liberación-de-reservas) |

## Pago, atención y entrega

| Reto de Syncro | Documentación para empezar |
| --- | --- |
| 15 · Preparar Stripe y crear entorno de prueba | [Reto 15](RETOS-ECOMMERCE.md#15-preparar-stripe-y-crear-entorno-de-prueba) y [estados de Stripe](ESTADOS-COMPRA.md#estados-de-stripe-y-estados-de-nova) |
| 16 · Crear una sesión de pago de prueba | [Reto 16](RETOS-ECOMMERCE.md#16-crear-una-sesión-de-pago-de-prueba) |
| 17 · Recibir y verificar webhooks | [Reto 17](RETOS-ECOMMERCE.md#17-recibir-y-verificar-webhooks) |
| 18 · Confirmar pagos y reconciliar incidencias | [Reto 18](RETOS-ECOMMERCE.md#18-confirmar-pagos-y-reconciliar-incidencias) y [estados de compra](ESTADOS-COMPRA.md) |
| 19 · Mostrar resultado de la compra | [Reto 19](RETOS-ECOMMERCE.md#19-mostrar-resultado-de-la-compra) |
| 20 · Listar pedidos en administración | [Reto 20](RETOS-ECOMMERCE.md#20-listar-pedidos-en-administración) |
| 21 · Ver detalle de pedido y preparar paquete | [Reto 21](RETOS-ECOMMERCE.md#21-ver-detalle-de-pedido-y-preparar-paquete) |
| 22 · Registrar envío manual y seguimiento | [Reto 22](RETOS-ECOMMERCE.md#22-registrar-envío-manual-y-seguimiento) |
| 23 · Enviar confirmaciones | [Reto 23](RETOS-ECOMMERCE.md#23-enviar-confirmaciones) |
| 24 · Cancelaciones, reembolsos y devoluciones | [Reto 24](RETOS-ECOMMERCE.md#24-cancelaciones-reembolsos-y-devoluciones) |

## Preparar el lanzamiento y ampliaciones

| Reto de Syncro | Documentación para empezar |
| --- | --- |
| 25 · Revisar seguridad y privacidad | [Reto 25](RETOS-ECOMMERCE.md#25-revisar-seguridad-y-privacidad) y [Vercel](VERCEL.md) |
| 26 · Probar el recorrido de extremo a extremo | [Reto 26](RETOS-ECOMMERCE.md#26-probar-el-recorrido-de-extremo-a-extremo), [pruebas locales](TESTING.md) y [prueba de pedidos](PEDIDOS-PRISMA-PASO-A-PASO.md#7-pruebas) |
| 27 · Preparar operación y lanzamiento | [Reto 27](RETOS-ECOMMERCE.md#27-preparar-operación-y-lanzamiento), [Vercel](VERCEL.md) y [transición de migraciones](PEDIDOS-PRISMA-PASO-A-PASO.md#6-cómo-trabajar-en-adelante) |
| 28 · Editar zonas y tarifas en el panel | [Reto 28](RETOS-ECOMMERCE.md#28-editar-zonas-y-tarifas-en-el-panel) |
| 29 · Preparar aviso automático por WhatsApp | [Reto 29](RETOS-ECOMMERCE.md#29-preparar-aviso-automático-por-whatsapp) |
| 30 · Enviar aviso por WhatsApp y recuperar fallos | [Reto 30](RETOS-ECOMMERCE.md#30-enviar-aviso-por-whatsapp-y-recuperar-fallos) |
| 31 · Proteger variantes al editar productos con reservas | [Reto 31](RETOS-ECOMMERCE.md#31-proteger-variantes-al-editar-productos-con-reservas) y [transacciones](PRISMA-REFERENCIA.md#transacciones) |
| 32 · Registrar tiempos y acuerdo comercial | [Reto 32](RETOS-ECOMMERCE.md#32-registrar-tiempos-y-acuerdo-comercial) |

La documentación técnica transversal y los informes históricos se encuentran en el [índice principal](README.md#por-tema).
