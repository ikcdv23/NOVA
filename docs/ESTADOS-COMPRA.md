# Estados de una compra en NOVA

[← Documentación](README.md) · [Mapa de retos](MAPA-RETOS.md) · **Reto 04**; también sirve para los retos 12 y 15–18.

Este documento recoge una primera propuesta para el reto 04. Los estados de pedido, reserva y envío son ideas para debatir; todavía no están implementados ni aprobados como diseño definitivo.

## Las piezas de una compra

| Pieza | Quién la gestiona | Qué nos indica |
| --- | --- | --- |
| Pago | Stripe | Si el pago está pendiente, en proceso, completado o necesita otra acción. |
| Pedido | NOVA | En qué punto está la compra: pendiente, confirmada, cancelada o enviada. |
| Reserva | NOVA | Si las unidades elegidas están apartadas, confirmadas o liberadas. |
| Envío | El dueño de la tienda y NOVA | Si el paquete está pendiente, en preparación o enviado. |

## Ejemplo: compra de la última chaqueta talla M

| Momento | Pago | Pedido | Reserva | Envío |
| --- | --- | --- | --- | --- |
| El comprador está eligiendo | No iniciado | No existe | No existe | No existe |
| Entra en el pago | Pendiente | Pendiente | Activa | Sin preparar |
| Stripe confirma el pago | Confirmado | Pendiente de preparación | Confirmada | Sin preparar |
| El dueño entrega la prenda al transportista | Confirmado | Enviado | Confirmada | Enviado |

Los nombres de esta tabla simplifican el proceso para poder estudiarlo. Por ejemplo, queda por decidir si una reserva pagada se llama «confirmada» o «consumida», y qué operación concreta modifica el stock. También hay que definir qué ocurre si un pago se confirma después de que caduque la reserva.

## Estados de Stripe y estados de NOVA

Stripe ya define los estados del pago. NOVA puede presentar estados más sencillos, pero debemos estudiar el evento y el estado real antes de decidir cada transición.

| Información de Stripe | Posible representación en NOVA |
| --- | --- |
| El pago aún no se ha completado o necesita una acción | Pago pendiente |
| El pago se está procesando | Pago en proceso |
| El pago se ha completado | Pago confirmado |
| El pago se ha cancelado o el proceso ha expirado | Pago cancelado o expirado, según el caso |

Esta tabla no es una correspondencia exhaustiva. Por ejemplo, tras el rechazo de un intento, un `PaymentIntent` puede volver a `requires_payment_method` y permitir otro intento: eso no implica necesariamente que todo el pedido esté cancelado. La expiración de una sesión de Checkout y la cancelación de un `PaymentIntent` tampoco son el mismo evento.

Un `PaymentIntent` representa el proceso de cobro. Un `SetupIntent` prepara un método de pago para usarlo en el futuro sin realizar ese cobro. Si usamos Stripe Checkout, también tendremos que estudiar la sesión de Checkout y sus eventos: sus estados no son idénticos a los de `PaymentIntent`.

## Siguiente pregunta para el reto

Si se rechaza un pago pero el comprador puede volver a intentarlo, ¿mantenemos la reserva durante un tiempo o la liberamos inmediatamente? Hay que decidirlo teniendo en cuenta las unidades disponibles, la duración de la sesión y los pagos que puedan confirmarse tarde.

## Referencias

- [Stripe: ciclo de vida de PaymentIntents y SetupIntents](https://docs.stripe.com/payments/paymentintents/lifecycle)
- [Stripe: preparación de pedidos con Checkout](https://docs.stripe.com/checkout/fulfillment)
