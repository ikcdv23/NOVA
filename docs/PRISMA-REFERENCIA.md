# Prisma: referencia para NOVA

[← Documentación](README.md) · [Mapa de retos](MAPA-RETOS.md) · Referencia para los retos 06–08, 13 y 31.

Esta guía explica las ideas de Prisma Client para consultar y modificar datos. Está pensada para Prisma 7 y para los modelos actuales de NOVA.

## Las piezas

- `prisma/schema.prisma` describe los modelos, sus campos y relaciones. Por ejemplo, `Product` representa una prenda y se relaciona con `Variant`.
- `prisma generate` genera un cliente y tipos de TypeScript a partir del esquema. Si cambias el esquema, vuelve a generarlo para actualizar el autocompletado.
- `src/lib/prisma.ts` crea y exporta la instancia compartida `prisma`. Los repositorios la utilizan para consultar la base de datos.
- Los repositorios agrupan operaciones de acceso a datos. El servicio coordina esas operaciones y las reglas de negocio.

El cliente expone cada modelo con inicial minúscula: el modelo `Product` se consulta mediante `prisma.product`. Una variable llamada `product` que contiene los datos de una prenda no es el cliente y no tiene los métodos de consulta.

## Create: crear un registro

`create` inserta un registro. Recibe un objeto con la propiedad `data`, que contiene los valores del nuevo registro, y devuelve el registro creado. El esquema determina qué campos son obligatorios y cuáles tienen un valor predeterminado.

El tipo generado `Prisma.ProductCreateInput` describe los datos aceptados para crear un producto, incluidas las relaciones que Prisma permite expresar de forma anidada. Es un tipo para comprobar y autocompletar: no ejecuta ninguna consulta.

```ts
// data contiene los campos necesarios para crear el producto.
export async function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data });
}
```

Aquí `data` es el objeto recibido por la función. `{ data }` es una abreviatura de `{ data: data }`. Prisma comprueba la forma de ese objeto según el modelo `Product`.

En NOVA, el `id` de `Product` no tiene un valor predeterminado en el esquema de Prisma; el servicio actual genera uno y lo proporciona. El precio del formulario validado se llama `price`, mientras que el campo del modelo Prisma se llama `priceCents`: hay que relacionar ambos al preparar los datos.

## Read: leer registros

- `findUnique` busca un registro mediante un identificador único, como el `id` o el `slug` de `Product`. Si no encuentra nada, devuelve `null`.
- `findFirst` devuelve el primer registro que cumple las condiciones, o `null` si no hay ninguno.
- `findMany` devuelve una lista, vacía si no hay coincidencias. Permite filtrar, ordenar y limitar resultados.

`where` describe las condiciones de búsqueda. `select` permite elegir campos; `include` permite solicitar relaciones, como las variantes de un producto.

```ts
// Un producto concreto: devuelve el producto o null.
const product = await prisma.product.findUnique({
  where: { id: productId },
});

// Una lista de productos publicados, con sus variantes.
const products = await prisma.product.findMany({
  where: { published: true },
  include: { variants: true },
});
```

## Update: actualizar un registro

`update` modifica un registro existente. Necesita `where` para identificarlo mediante al menos un campo único, y `data` para indicar los cambios. Devuelve el registro actualizado y da un error si no encuentra el registro.

`updateMany` actualiza los registros que cumplan un filtro y devuelve cuántos se han modificado. No exige identificar un único registro: revisa el filtro con cuidado.

```ts
export async function renameProduct(productId: string, name: string) {
  return prisma.product.update({
    where: { id: productId }, // ¿Qué producto?
    data: { name },           // ¿Qué campo cambia?
  });
}
```

Este ejemplo cambia solo el nombre. No reproduce por completo el comportamiento de edición de NOVA: por ejemplo, el código actual también actualiza la fecha.

En NOVA, la función `saveProduct` distingue entre crear y editar. En la rama de edición también actualiza `updatedAt`; al traducirla hay que conservar ese comportamiento, ya que el campo actual tiene un valor predeterminado pero no está marcado con `@updatedAt`.

## Delete: eliminar registros

`delete` elimina un registro identificado por `where` y devuelve el registro eliminado. Necesita al menos un campo único y da un error si no encuentra el registro. `deleteMany` elimina todos los registros que coincidan con el filtro y devuelve cuántos eliminó.

En el ejemplo de una función de borrado, la propiedad dentro de `where` debe ser un campo único real del modelo elegido; el valor debe ser el identificador recibido por la función. Un nombre de ejemplo como `[your_element]Id` y una variable distinta como `taskId` no se pueden copiar literalmente y esperar que encajen.

```ts
export async function deleteProductById(productId: string) {
  return prisma.product.delete({
    where: { id: productId },
  });
}
```

`id` es el campo del modelo; `productId` es la variable cuyo valor buscamos. Esta función aislada sirve para entender `delete`, pero no reemplaza el borrado completo de NOVA explicado a continuación.

Antes de cambiar el borrado de productos de NOVA, revisa su comportamiento actual: además de eliminar el producto, registra claves de imágenes para su limpieza. Las relaciones con variantes e imágenes tienen `onDelete: Cascade` en el esquema, pero eso no sustituye la lógica de limpieza de archivos externos.

## Transacciones

Una transacción agrupa operaciones de base de datos para que se confirmen juntas o se deshagan si falla el proceso. En Prisma, una transacción interactiva entrega un cliente de transacción al código que se ejecuta dentro de ella.

`Prisma.TransactionClient` es el tipo de ese cliente. Un parámetro opcional `tx` permite que un repositorio reciba ese cliente; la expresión `tx ?? prisma` significa «usar `tx` si existe; de lo contrario, usar `prisma`». Así, la misma función puede participar en una transacción de Prisma o ejecutarse por separado. `PrismaTx`, si se usa como nombre corto, debe estar definido como alias; no es un nombre automático.

```ts
// Prisma es un tipo importado del cliente generado de NOVA.
export async function renameProduct(
  productId: string,
  name: string,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return client.product.update({
    where: { id: productId },
    data: { name },
  });
}

// Sin transacción explícita: la función usa prisma.
await renameProduct(productId, 'Chaqueta vintage');

// Con transacción Prisma: la función utiliza tx.
await prisma.$transaction(async (tx) => {
  await renameProduct(productId, 'Chaqueta vintage', tx);
  // Otras consultas con tx pueden participar en la misma transacción.
});
```

Los fragmentos son ejemplos independientes: se presupone que `prisma` y el tipo `Prisma` están importados y que `productId` contiene un identificador válido. No son un reemplazo directo del servicio actual.

En NOVA, los servicios de administración y medios abren transacciones con `prisma.$transaction` y pasan el cliente `tx` a sus repositorios. El bloqueo de la fila se conserva mediante SQL ejecutado dentro de esa misma transacción. Un `PoolClient` de `pg` no es un `Prisma.TransactionClient`: si se mezclan operaciones de ambos clientes, no comparten automáticamente la transacción.

Prisma también permite escrituras anidadas para crear o actualizar registros relacionados en una misma operación. Aun así, hay que revisar todas las operaciones que componen el caso de uso antes de elegir cómo agruparlas.

## Consultas y migraciones son cosas distintas

Prisma Client lee y modifica registros. Las migraciones cambian la estructura de la base de datos y mantienen un historial de esos cambios. Generar el cliente no crea ni modifica tablas.

NOVA conservaba migraciones SQL propias en `db/migrations` y su historial en `schema_migrations`. Esta rama utiliza Prisma Migrate, que tiene su propio historial. Antes de usarlo sobre una base existente, hay que comprobar que el esquema coincide con el punto inicial y planear la transición; no se debe reiniciar una base con datos sin entender las consecuencias.

Para una explicación desde cero, un ejemplo real de NOVA y el flujo para otros proyectos, consulta [Migraciones para principiantes](./MIGRACIONES.md).

## Documentación oficial

- [Operaciones CRUD en Prisma 7](https://www.prisma.io/docs/orm/v7/prisma-client/queries/crud)
- [Transacciones en Prisma 7](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions)
- [Consultas y escrituras de relaciones](https://www.prisma.io/docs/orm/v7/prisma-client/queries/relation-queries)
