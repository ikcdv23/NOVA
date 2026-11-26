# NOVA: retos para construir y aprender ecommerce

[← Documentación](README.md) · [Mapa de retos](MAPA-RETOS.md) · [Estados de una compra](ESTADOS-COMPRA.md) · [Pedidos y Prisma paso a paso](PEDIDOS-PRISMA-PASO-A-PASO.md)

Este itinerario está pensado para doesarrollar NOVA de forma atomica. Cada reto termina en una evidencia comprobable. La idea es adquirir buenass practicas y tratar el proyecto como un desarrollo profesional simulando entornos de trabajo coolaborativo reales.

**Estado:** plan para revisar y cargar en Syncro; las decisiones comerciales pendientes están identificadas más abajo. NOVA ya tiene productos, variantes con stock por talla, carrito y un panel. El carrito actual prepara una solicitud por WhatsApp; no cobra ni reserva el stock. La migración a Prisma está en la PR 7 y debe comprobarse contra la rama desde la que se empiece a trabajar.

**Alcance acordado hasta ahora:** el cliente prepara y envía los paquetes; el comprador puede comprar sin cuenta; se plantea Stripe para tarjeta; destinos europeos y envíos cobrados; tarifas configurables; seguimiento en la página del pedido; correo de confirmación con enlace privado; aviso automático por WhatsApp al dueño; gestión manual con su transportista. El panel es la fuente de verdad del pedido. Usad datos ficticios, bases aisladas y modo de prueba para desarrollar. No uséis pagos reales hasta completar las comprobaciones de lanzamiento.

**Pendiente de confirmar:**

- Lista concreta de países.
- Tarifas y costes especiales por territorio o peso.
- Datos del transportista.
- Proveedores y costes de WhatsApp y del correo.
- Si se enviará otro correo al añadir el seguimiento.
- Condiciones de devoluciones, facturación e impuestos.

Los precios observados en otras tiendas son solo ejemplos de prueba hasta que el cliente apruebe sus propias tarifas. Una zona sin tarifa aprobada no estará disponible para compras reales.

## Cómo trabajar cada reto

1. Leer la teoría y recorrer la parte del código indicada. Intentar explicarse el flujo entre los dos, entenderlo y ser capaz de defenderlo.
2. Escribir un pequeño diseño o ejemplo con datos ficticios antes de implementar.
3. Implementar el cambio, revisarlo juntos y ejecutar la comprobación indicada.
4. Anotar dudas, decisiones y enlaces en la tarea. Si un reto resulta grande, dividirlo manteniendo sus comprobaciones.

Los enlaces de referencia son puntos de partida: comprobar versión instalada y la documentación vigente antes de integrar una biblioteca o proveedor.

## 01. Entrevistar al cliente y acotar la primera versión

**Objetivo:** descubrir cómo funciona el negocio antes de decidir la implementación.

**Teoría:** un requisito describe una necesidad; una hipótesis es algo que aún no hemos confirmado. El coste, el stock y la entrega pueden cambiar el diseño técnico.

**Aplicación:** confirmad con el cliente transportista, países, tarifas por territorio, peso, embalaje, cuenta Stripe, facturas, impuestos, devoluciones y titularidad de servicios. Registrad la intención de enviar un correo al comprador y un aviso por WhatsApp al dueño. Preparad ejemplos de una y de varias prendas.

**Terminado cuando:** hay respuestas o responsables para las preguntas pendientes, zonas y reglas provisionales, funciones incluidas/excluidas y una lista de decisiones bloqueadas. No inventéis tarifas.

**Referencia:** [AEPD: obligaciones de protección de datos](https://www.aepd.es/derechos-y-deberes/cumplimiento-de-las-obligaciones).

## 02. Dibujar el recorrido completo de una compra

**Objetivo:** entender qué ocurre desde el carrito hasta la entrega.

**Teoría:** una compra atraviesa sistemas distintos: navegador, servidor, base de datos, pasarela y negocio. Cada uno puede fallar por separado.

**Aplicación:** dibujad un diagrama con comprador, NOVA, Stripe, correo, WhatsApp y dueño. Incluid carrito, dirección, tarifa, pedido, pago, webhook verificado, reserva, correo con enlace privado, aviso al dueño, preparación y seguimiento manual. Añadid caminos para pago fallido, aviso fallido y carrito abandonado.

**Terminado cuando:** ambos podéis explicar qué sistema inicia y confirma cada paso y dónde se guarda cada dato. Identificad qué pasos dependen de decisiones del reto 01.

**Referencia:** [Stripe: funcionamiento de Checkout](https://docs.stripe.com/payments/checkout/how-checkout-works).

## 03. Investigar el carrito que ya existe

**Objetivo:** saber qué se puede reutilizar y dónde están sus límites.

**Teoría:** el estado del navegador es cómodo para la interfaz, pero puede estar anticuado o ser modificado. Un carrito no implica una reserva de stock.

**Aplicación:** leed `src/modules/cart/provider.tsx`, `logic.ts` y `service/cart-service.ts`; seguid una prenda desde añadirla hasta la solicitud por WhatsApp. Identificad dónde se guardan talla y cantidad y cuándo se comprueba el precio.

**Terminado cuando:** podéis explicar el recorrido con un ejemplo, listar qué se conserva al recargar y demostrar que el carrito actual no descuenta ni reserva existencias.

**Referencia:** [React: compartir estado](https://react.dev/learn/sharing-state-between-components).

## 04. Definir vocabulario y estados

**Objetivo:** distinguir carrito, pedido, pago, reserva y envío.

**Teoría:** un pedido puede estar pendiente mientras el pago aún no se ha confirmado; el estado del pago y el del envío no necesariamente son el mismo.

**Aplicación:** escribid una tabla de estados y transiciones permitidas para pedido, pago y reserva. Incluid creación, pago correcto, fallo, caducidad, cancelación y envío. Decidid quién puede realizar cada transición.

**Terminado cuando:** podéis representar una compra exitosa y tres fallidas sin usar términos ambiguos; dejad identificadas las decisiones aún abiertas.

**Referencia:** [Stripe: ciclo de vida de PaymentIntents](https://docs.stripe.com/payments/paymentintents/lifecycle).

## 05. Diseñar los datos del pedido

**Objetivo:** representar una compra sin depender de cambios posteriores del catálogo.

**Teoría:** una línea de pedido guarda una instantánea del nombre, talla, cantidad y precio comprados. Una referencia al producto por sí sola no conserva la historia si se edita o elimina.

**Aplicación:** dibujad tablas de pedido y líneas; incluid moneda, importes en unidades menores, datos mínimos de contacto y dirección, referencias opcionales y fechas. Determinad restricciones y comportamiento al borrar un producto.

**Terminado cuando:** un ejemplo con dos tallas conserva sus importes y nombres después de modificar o retirar un producto; explicad la relación uno a muchos.

**Referencia:** [PostgreSQL: claves y restricciones](https://www.postgresql.org/docs/current/ddl-constraints.html).

## 06. Preparar la migración de pedidos

**Objetivo:** crear la estructura del reto 05 sin alterar datos existentes.

**Teoría:** una migración cambia la base; `prisma generate` crea el cliente tipado. En NOVA las migraciones actuales se aplican con su ejecutor SQL propio.

**Aplicación:** leed `docs/MIGRACIONES.md`, escribid una nueva migración SQL y actualizad `prisma/schema.prisma`. Probad desde una base de pruebas vacía y desde otra con las migraciones anteriores aplicadas. Generad el cliente.

**Terminado cuando:** ambas bases llegan a la estructura prevista, las migraciones anteriores no se reescriben y Prisma puede trabajar con los modelos nuevos.

**Referencia:** [Guía local de migraciones](./MIGRACIONES.md).

## 07. Implementar repositorio de pedidos

**Objetivo:** guardar y leer pedidos mediante operaciones pequeñas y comprensibles.

**Teoría:** el repositorio encapsula acceso a datos; el servicio coordina reglas del negocio. Una transacción agrupa escrituras que deben confirmarse juntas.

**Aplicación:** cread funciones para guardar un pedido con sus líneas y consultar un pedido. Usad el cliente de transacción cuando el servicio lo necesite; evitad devolver datos sensibles que no se usan.

**Terminado cuando:** una prueba verifica que pedido y líneas se guardan juntos y que un fallo deja la base sin escritura parcial.

**Referencia:** [Prisma: transacciones](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions).

## 08. Calcular importes en el servidor

**Objetivo:** obtener el precio real de una selección sin confiar en importes del navegador.

**Teoría:** el carrito puede contener identificadores y cantidades, pero el servidor debe recuperar precios y verificar productos publicados. Usar céntimos enteros evita errores habituales de decimales binarios.

**Aplicación:** reutilizad las validaciones existentes de `src/modules/cart/logic.ts`; combinad líneas repetidas, comprobad talla y cantidad, consultad precios actuales y calculad el subtotal. El envío se añadirá cuando haya reglas confirmadas.

**Terminado cuando:** pruebas cubren precio manipulado, producto oculto, talla inexistente, cantidad inválida y suma de varios artículos.

**Referencia:** [OWASP: validación de entradas](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html).

## 09. Recoger datos de contacto y dirección

**Objetivo:** preparar los datos mínimos que el negocio necesita para tramitar el pedido.

**Teoría:** la validación del navegador ayuda al usuario; la validación del servidor protege el sistema. Los datos personales requieren acceso restringido y una finalidad clara.

**Aplicación:** definid campos con el cliente, implementad un formulario accesible y una validación en servidor; restringid países o zonas según lo acordado. No registréis direcciones completas en logs innecesarios.

**Terminado cuando:** errores concretos se muestran de forma comprensible, no se aceptan datos inválidos mediante una petición directa y se han revisado permisos y datos recogidos.

**Referencia:** [W3C: formularios accesibles](https://www.w3.org/WAI/tutorials/forms/).

## 10. Diseñar las tarifas de envío

**Objetivo:** transformar las reglas del cliente en un cálculo verificable.

**Teoría:** una tarifa puede depender de zona, peso, importe o servicio. El precio mostrado debe corresponder a las reglas aplicadas al pedido.

**Aplicación:** definid países y zonas configurables, comenzando con tarifas fijas provisionales tomadas como referencia de otras tiendas. Identificad por separado península, Baleares, Canarias, Ceuta, Melilla y otros países para que el cliente pueda aprobar o modificar sus reglas. Si depende del peso, identificad dónde se guardan peso de producto y embalaje. Separad el cálculo de la interfaz.

**Terminado cuando:** hay ejemplos de prueba para destinos admitidos, desconocidos y sin tarifa; la compra real queda bloqueada si el destino no está habilitado o la tarifa no está aprobada. Se conserva en el pedido el importe y la zona aplicados. El diseño puede avanzar con datos ficticios; los valores reales dependen de la aprobación del cliente.

**Referencia:** [Stripe: opciones de envío en Checkout](https://docs.stripe.com/payments/during-payment/charge-shipping).

## 11. Crear un pedido pendiente desde el carrito

**Objetivo:** unir productos, dirección y totales en un pedido preparado para pagar.

**Teoría:** una operación debe verificar de nuevo los datos del carrito antes de guardar el pedido. Reintentos y dobles clics pueden originar duplicados si no se diseñan.

**Aplicación:** conectad el formulario con el cálculo del servidor y el repositorio; guardad líneas e importes calculados. Definid qué pasa con dos solicitudes repetidas y cómo se identifica el pedido en el siguiente paso.

**Terminado cuando:** se crea un pedido de prueba coherente, no se aceptan precios del navegador y una repetición no genera ventas inesperadas.

**Dependencias:** retos 07–10 y decisiones de stock del 12.

## 12. Diseñar reservas por talla

**Objetivo:** definir cómo proteger la última unidad durante el pago.

**Teoría:** una condición de carrera aparece cuando dos operaciones comprueban el mismo stock y ambas creen que queda una unidad. Una transacción y una actualización condicionada o bloqueo pueden coordinar el acceso; hay que contemplar expiración y pagos tardíos.

**Aplicación:** con un ejemplo de producto/talla y stock 1, diseñad cómo reservar, confirmar y liberar cantidades. Elegid duración y mecanismo de expiración. Especificad qué ocurre si un pago llega tras caducar y cómo se reconcilia o reembolsa.

**Terminado cuando:** está documentada la política de disponibilidad, las transiciones y los casos de pago tardío; el cliente comprende sus implicaciones.

**Referencia:** [PostgreSQL: concurrencia](https://www.postgresql.org/docs/current/mvcc.html).

## 13. Implementar y probar reserva concurrente

**Objetivo:** que operaciones simultáneas no reserven más unidades que las disponibles.

**Teoría:** el control debe ocurrir en la base de datos, no solo deshabilitando un botón. Las reservas deben quedar vinculadas al pedido y tener una expiración.

**Aplicación:** implementad el diseño del reto 12, con transacción y restricciones adecuadas. Haced un test contra PostgreSQL aislado con dos solicitudes simultáneas para una única unidad.

**Terminado cuando:** solo una reserva tiene éxito, no hay stock negativo y un fallo revierte todos los cambios asociados.

**Referencia:** [Prisma: transacciones](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions).

## 14. Caducidad y liberación de reservas

**Objetivo:** que un carrito abandonado no bloquee una prenda indefinidamente.

**Teoría:** las tareas programadas pueden ejecutarse tarde o repetirse; liberar una reserva debe ser seguro ante reintentos y no liberar una venta ya confirmada.

**Aplicación:** implementad una rutina para localizar y liberar reservas vencidas según el estado del pedido/pago. Acordad cómo se ejecutará y supervisará en producción. Tratad explícitamente el pago tardío.

**Terminado cuando:** una prueba cubre expiración, reejecución, compra confirmada y carrera entre pago y expiración.

## 15. Preparar Stripe y crear entorno de prueba

**Objetivo:** comprobar que el proveedor cubre el negocio antes de integrar.

**Teoría:** una pasarela procesa pagos y cobra comisiones; el titular de la cuenta, los métodos admitidos, los reembolsos y las disputas tienen consecuencias operativas.

**Aplicación:** confirmad la cuenta de Stripe del cliente y quién la administra, comprobad métodos y tarifas, y configurad un entorno de prueba con credenciales protegidas. No subáis claves a Git ni uséis datos de tarjetas reales para pruebas.

**Terminado cuando:** el cliente comprende quién recibe el dinero y paga las comisiones, y tenéis acceso aislado de prueba y documentación de la opción elegida.

**Referencia:** [Stripe: precios en España](https://stripe.com/es/pricing) y [pruebas de Stripe](https://docs.stripe.com/testing).

## 16. Crear una sesión de pago de prueba

**Objetivo:** iniciar un pago desde un pedido válido.

**Teoría:** una sesión de checkout representa un intento de pago. El importe debe venir de datos verificados en el servidor. El usuario puede abandonar o iniciar más de un intento.

**Aplicación:** cread la sesión usando el pedido y sus importes, guardad su identificador y redirigid al comprador. Definid control de repetición, expiración y qué pasa si la creación externa falla después de guardar datos locales.

**Terminado cuando:** un pedido válido abre el checkout de prueba con importe correcto; los intentos repetidos no producen cobros inesperados y los errores quedan recuperables.

**Referencia:** [Stripe Checkout](https://docs.stripe.com/payments/checkout).

## 17. Recibir y verificar webhooks

**Objetivo:** recibir cambios de pago de manera fiable desde el proveedor.

**Teoría:** un webhook es una petición entre servidores. El proveedor puede reenviarla; la firma permite comprobar su autenticidad y hay que conservar el cuerpo en el formato exigido para validarla.

**Aplicación:** cread una ruta para recibir eventos de prueba, verificad firma y secreto antes de procesarlos e identificad el pedido. Guardad identificadores de evento y responded de forma apropiada a fallos.

**Terminado cuando:** una firma inválida no modifica pedidos; eventos reales de prueba se reciben y procesan; un mismo evento repetido no duplica efectos.

**Referencia:** [Stripe: webhooks y firmas](https://docs.stripe.com/webhooks).

## 18. Confirmar pagos y reconciliar incidencias

**Objetivo:** mantener pedido, pago y stock coherentes incluso con reintentos y retrasos.

**Teoría:** volver a la página de éxito no demuestra por sí solo que el dinero esté confirmado. Un evento recibido dos veces o fuera de orden no debe vender dos veces.

**Aplicación:** aplicad las transiciones del reto 04 y confirmad la reserva solo cuando corresponda al método de pago. Diseñad reintentos, pagos tardíos y un procedimiento de conciliación para detectar pagos y pedidos que no coinciden.

**Terminado cuando:** pruebas cubren éxito, fallo, repetición, eventos fuera de orden y pago después de expirar; existe una acción clara para revisión manual de incidencias.

**Referencia:** [Stripe: completar pedidos](https://docs.stripe.com/checkout/fulfillment).

## 19. Mostrar resultado de la compra

**Objetivo:** comunicar al comprador lo que se sabe sin inventar un pago confirmado.

**Teoría:** el navegador puede regresar antes del webhook o no regresar. La interfaz debe distinguir confirmación, pago pendiente, cancelación y error.

**Aplicación:** cread vistas de resultado accesibles y un enlace privado de seguimiento para compras sin cuenta: token impredecible, acceso limitado a la información necesaria, posibilidad de revocar o renovar, y cuidado de no filtrarlo en logs o servicios externos. Decidid caducidad y recuperación de acceso. El enlace se entrega también en el correo del reto 23.

**Terminado cuando:** las pantallas reflejan el estado real, muestran seguimiento cuando exista y un tercero no accede cambiando el identificador; se han probado enlace inválido, revocado y caducado si aplica.

**Referencia:** [OWASP: control de acceso](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## 20. Listar pedidos en administración

**Objetivo:** que el dueño identifique ventas y su estado.

**Teoría:** el panel gestiona datos privados y debe comprobar permisos en el servidor, no solo ocultar botones.

**Aplicación:** cread una lista protegida con identificador, fecha, importe y estados. Añadid una forma práctica de localizar pedidos y contemplad lista vacía y errores.

**Terminado cuando:** un administrador ve sus pedidos y una persona sin sesión no puede acceder ni solicitar los datos directamente.

**Referencia:** [Next.js: autenticación y autorización](https://nextjs.org/docs/app/guides/authentication).

## 21. Ver detalle de pedido y preparar paquete

**Objetivo:** que el cliente sepa qué prendas y tallas preparar.

**Teoría:** las líneas deben mostrar el contenido histórico del pedido, no el precio actual del catálogo. Solo se deben mostrar datos personales a usuarios autorizados.

**Aplicación:** mostrad líneas, cantidades, totales, contacto, dirección y estado en una vista protegida. Incluid un estado de preparación y definid qué acciones están permitidas antes del pago.

**Terminado cuando:** el dueño puede preparar un paquete de prueba y un pedido impagado no aparece como listo para enviar.

## 22. Registrar envío manual y seguimiento

**Objetivo:** reflejar en NOVA un envío gestionado con el transportista del cliente.

**Teoría:** gestionar una etiqueta en el portal de un transportista es diferente de integrar su API. El número de seguimiento puede no estar disponible inmediatamente.

**Aplicación:** tras confirmar el proceso real, guardad transportista, fecha y referencia opcional; permitid marcar como enviado solo en estados válidos. Si se usa una URL de seguimiento, comprobad su origen y formato.

**Terminado cuando:** un pedido pagado puede pasar a enviado con datos correctos y un usuario sin permisos no puede modificarlo.

## 23. Enviar confirmaciones

**Objetivo:** enviar al comprador la confirmación y su enlace privado sin perder el pedido si falla el correo.

**Teoría:** enviar correo es una operación externa y puede fallar después de que la base se haya actualizado. Reintentar sin control puede enviar duplicados.

**Aplicación:** elegid un proveedor y plantilla mínima; tras confirmar el pago, enviad al comprador el resumen y enlace privado de seguimiento. Registrad resultado y diseñad reintentos e identificación del mensaje. Consultad al cliente si quiere un correo adicional cuando se registre el envío.

**Terminado cuando:** un pago correcto produce la comunicación prevista; si el servicio de correo falla, el pedido sigue consultable y el fallo puede recuperarse sin duplicar efectos.

## 24. Cancelaciones, reembolsos y devoluciones

**Objetivo:** acordar y practicar el proceso después de una incidencia o devolución.

**Teoría:** cancelar un pedido, devolver una prenda y reembolsar un pago son acciones distintas. Un reembolso externo y un cambio local pueden fallar por separado.

**Aplicación:** documentad con el cliente los casos admitidos, quién toma la decisión, cómo se registra el reembolso y cuándo vuelve la prenda al stock. Para la primera versión, evaluad tramitar el reembolso en el panel del proveedor y reflejarlo en NOVA con un proceso de conciliación.

**Terminado cuando:** hay instrucciones y pruebas para cancelar antes del pago, reembolso total o parcial si se admite, fallo y reintento; se evita reponer stock dos veces.

**Referencia:** [Stripe: reembolsos](https://docs.stripe.com/refunds).

## 25. Revisar seguridad y privacidad

**Objetivo:** proteger datos del comprador y operaciones de administración.

**Teoría:** la seguridad se aplica en cada límite de confianza: formulario, servidor, base, proveedor y panel. La normativa y los textos dependen del negocio y deben revisarse con quien corresponda.

**Aplicación:** revisad autorización de cada operación, datos y logs, secretos, copias de seguridad, plazos de conservación, correos y accesos a proveedores. Coordinad con el cliente la revisión profesional de avisos, privacidad y condiciones.

**Terminado cuando:** existe una lista documentada de accesos y datos, se han probado acciones sin sesión y los aspectos legales pendientes tienen responsable.

**Referencia:** [AEPD: obligaciones](https://www.aepd.es/derechos-y-deberes/cumplimiento-de-las-obligaciones) y [OWASP: autorización](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## 26. Probar el recorrido de extremo a extremo

**Objetivo:** demostrar que las piezas funcionan juntas.

**Teoría:** una prueba unitaria comprueba una pieza; una de integración comprueba su colaboración con otros sistemas; una de extremo a extremo sigue el recorrido completo.

**Aplicación:** con PostgreSQL y proveedores de prueba, comprobad: carrito de varias tallas, tarifas modificadas y destinos sin cobertura, compra correcta, rechazo, abandono, última unidad simultánea, webhook duplicado, pago tardío, panel, enlace privado, correo, WhatsApp y envío. Ejecutad las pruebas existentes y revisad sus datos iniciales.

**Terminado cuando:** los escenarios críticos pasan o sus fallos tienen responsable y solución documentada; no se usan credenciales ni cobros de producción.

**Referencia:** [Playwright: pruebas](https://playwright.dev/docs/writing-tests) y `docs/TESTING.md`.

## 27. Preparar operación y lanzamiento

**Objetivo:** que el cliente pueda operar y recuperar el servicio cuando haya incidencias.

**Teoría:** publicar código no equivale a tener un negocio operativo: hay que saber quién paga servicios, supervisa errores, hace copias y atiende pedidos.

**Aplicación:** documentad cuentas y titularidad, acceso del cliente, migraciones, variables por entorno, copias y restauración probada, alertas, conciliación de pagos, soporte y costes. Haced una demostración completa al cliente y acordad la activación de producción.

**Terminado cuando:** existe una guía de operación y recuperación, se han comprobado los servicios y límites contratados y el cliente acepta el alcance y las tareas pendientes.

## 28. Editar zonas y tarifas en el panel

**Objetivo:** permitir al dueño ajustar precios sin cambiar código.

**Teoría:** la configuración de una tarifa es distinta del precio ya guardado en un pedido. Las acciones administrativas necesitan autorización en el servidor.

**Aplicación:** modelad zonas, países o territorios y tarifa fija; añadid un formulario protegido para activarlas y editar importes en céntimos. Impedid reglas solapadas o destinos sin una regla válida. Conservad una copia del precio aplicado en el pedido; un cambio posterior no lo modifica.

**Terminado cuando:** el dueño puede cambiar una tarifa, el cálculo nuevo usa el nuevo precio, los pedidos anteriores no cambian y un usuario sin permisos no puede modificarla. Los valores de muestra no se activan para producción sin aprobación.

**Dependencias:** 01, 06, 10 y modelo de configuración; puede diseñarse con datos ficticios mientras se esperan tarifas. **Referencia:** [OWASP: autorización](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## 29. Preparar aviso automático por WhatsApp

**Objetivo:** seleccionar una forma viable de avisar al dueño de cada pedido pagado.

**Teoría:** un enlace que abre WhatsApp necesita que alguien pulse enviar; una API de mensajería permite automatización y puede requerir cuenta empresarial, plantillas, aprobación y costes según las condiciones vigentes.

**Aplicación:** investigad WhatsApp Business Platform o un proveedor compatible, requisitos de la cuenta y número de origen y destino, plantillas, costes y pruebas. Acordad con el dueño quién es titular y quién paga. Diseñad un aviso mínimo con enlace protegido al panel, sin dirección completa.

**Terminado cuando:** hay una opción aprobada, coste y responsables conocidos, un ejemplo de mensaje y una estrategia si el proveedor falla; el pedido seguirá disponible en el panel.

**Referencia:** [WhatsApp Business Platform](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview/).

## 30. Enviar aviso por WhatsApp y recuperar fallos

**Objetivo:** notificar al dueño una vez confirmado el pago sin duplicar la compra.

**Teoría:** la confirmación del pago y el envío de un mensaje son operaciones diferentes: un fallo externo no debe revertir un pago ya confirmado. Los reintentos necesitan identificación y seguimiento.

**Aplicación:** tras el pago confirmado, registrad una notificación pendiente y enviadla mediante el proveedor del reto 29. Guardad su resultado, permitid reintentar y evitad datos personales innecesarios. Investigad la posibilidad de entregas duplicadas ante un tiempo de espera y cómo detectarlas.

**Terminado cuando:** un pago confirmado genera el aviso de prueba, eventos repetidos no crean múltiples notificaciones intencionadas, un fallo se puede revisar y reintentar, y el pedido sigue visible. No afirmar entrega exacta única si el proveedor no la garantiza.

**Dependencias:** 18, 20 y 29.

## 31. Proteger variantes al editar productos con reservas

**Objetivo:** evitar que un cambio administrativo invalide una reserva o pedido.

**Teoría:** `saveProduct` actualmente borra y vuelve a crear las variantes; esto puede interferir con referencias, reservas o cambios simultáneos de stock una vez exista checkout.

**Aplicación:** revisad `src/modules/admin/repository/admin-repository.ts`, diseñad identificadores y reglas para editar cantidades y tallas conservando reservas activas, y sincronizad las operaciones con el control de stock. Definid qué ocurre al ocultar o eliminar una talla reservada.

**Terminado cuando:** pruebas cubren edición concurrente con checkout, talla reservada, cambio de stock y pedido histórico; no se pierden ni duplican unidades y la operación conflictiva muestra una respuesta clara.

**Dependencias:** 05 y 12; debe resolverse antes de activar el checkout con reservas. **Referencia:** [PostgreSQL: concurrencia](https://www.postgresql.org/docs/current/mvcc.html).

## 32. Registrar tiempos y acuerdo comercial

**Objetivo:** mantener claro el alcance, los gastos y el tiempo real invertido por las dos personas.

**Teoría:** un coste de desarrollo, una suscripción y un coste por transacción son conceptos diferentes. El aprendizaje lleva tiempo y el soporte requiere límites acordados.

**Aplicación:** anotad el acuerdo de desarrollo; confirmad cuenta Stripe del cliente y que sus comisiones corren por su cuenta. Documentad la propuesta de mantenimiento de 60 €/mes, Vercel incluido, solo si el cliente la acepta: límites de uso, otros servicios, soporte, horas, cambios, exceso y duración. Registrad vuestras horas por reto y persona en Syncro.

**Terminado cuando:** el cliente y vosotros conocéis y aceptáis qué está incluido, quién paga cada servicio y cómo se tratan las ampliaciones; sin dar por cerrado el acuerdo mensual antes de su aceptación.

**Referencia:** [Vercel Pro](https://vercel.com/docs/plans/pro-plan) y [Stripe España](https://stripe.com/es/pricing).

## Orden y dependencias

Empezad por 01–05 y 32. Después avanzad en 06–10; diseñad el stock en 12 antes de cerrar 11 y 16. Implementad y probad 13–14 y 31 antes de activar reservas. Preparad Stripe 15–18; panel y envío 19–22 y 28; correo 23 y WhatsApp 29–30; devoluciones y seguridad 24–25. El reto 26 verifica el conjunto y 27 prepara el uso real. Varias tareas pueden estudiarse en paralelo, pero no marquéis un flujo como completo sin sus dependencias y pruebas.

Las tarifas, países concretos, transportista, proveedores de correo y WhatsApp, segundo correo de seguimiento y proceso de devoluciones siguen pendientes de confirmación. Este documento prepara los retos: no crea ni asigna tareas automáticamente en Syncro.
