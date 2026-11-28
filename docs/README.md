# Documentación de NOVA

Esta es la puerta de entrada para encontrar documentación del proyecto y relacionarla con los retos de Syncro. Los números corresponden a los títulos de las tareas del proyecto **NOVA** en Syncro. Los archivos de referencia no significan que un reto esté terminado: consultad sus criterios y estado en Syncro.

## Empezar por aquí

1. [Guía general del proyecto](../README.md): instalación, arquitectura y funcionamiento actual.
2. [Retos de ecommerce](RETOS-ECOMMERCE.md): los 32 retos, sus objetivos, teoría, ejercicios y criterios.
3. [Mapa de retos y documentación](MAPA-RETOS.md): qué leer para cada reto y dónde encontrar cada parte.

## Por tema

| Si quieres... | Lee | Relación con retos |
| --- | --- | --- |
| Entender carrito, pedidos, pagos y reservas | [Estados de una compra](ESTADOS-COMPRA.md) | 03, 04, 12 y 15–18 |
| Seguir el trabajo preparado de pedidos | [Pedidos y Prisma paso a paso](PEDIDOS-PRISMA-PASO-A-PASO.md) | 04–08 |
| Aprender consultas y transacciones | [Referencia de Prisma](PRISMA-REFERENCIA.md) y [Prisma en NOVA](../prisma/README.md) | 06–08, 13 y 31 |
| Entender migraciones y la transición | [Migraciones para principiantes](MIGRACIONES.md) y [transición a Prisma Migrate](PEDIDOS-PRISMA-PASO-A-PASO.md#2-crear-el-punto-de-partida) | 06 y 27 |
| Ejecutar pruebas | [Comprobaciones locales](TESTING.md) | 07, 08 y 26 |
| Entender alojamiento, variables e imágenes | [NOVA en Vercel](VERCEL.md) | 15, 22, 25 y 27; referencia transversal |
| Consultar decisiones y revisiones de diseño | [Diseño](DESIGN.md), [componentes](../src/components/README.md) y [estilos](../src/styles/README.md) | Referencia transversal |
| Consultar resultados anteriores | [Verificación de la entrega](VERIFICATION.md) | Evidencia histórica; no sustituye pruebas actuales |
| Crear un módulo | [Plantilla de módulo](../src/modules/_template/README.md) | Referencia para 07 y otros retos de código |

## Estado del trabajo de pedidos

En la rama `define-vocabulary-and-states` se prepararon cambios locales para los retos 04–08. [La guía paso a paso](PEDIDOS-PRISMA-PASO-A-PASO.md) explica el alcance y lo que queda por revisar. El estado de Git determina si esos cambios están confirmados o subidos; este índice no sustituye esa comprobación.

**Migraciones:** los scripts de esta rama usan Prisma Migrate. Las bases existentes con el historial antiguo requieren una transición revisada antes de aplicar migraciones; consultad la [guía](PEDIDOS-PRISMA-PASO-A-PASO.md#6-cómo-trabajar-en-adelante) y el entorno. No se han modificado bases remotas.

## Mantener la documentación

Al avanzar un reto, añadid enlaces a las guías relevantes en [MAPA-RETOS.md](MAPA-RETOS.md), explicad las decisiones y pruebas en el documento correspondiente y actualizad Syncro cuando realmente se cumplan sus criterios. Marcad las propuestas y la información histórica para no confundirlas con el comportamiento actual.
