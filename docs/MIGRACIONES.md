# Migraciones de bases de datos para principiantes

[← Documentación](README.md) · [Mapa de retos](MAPA-RETOS.md) · **Reto 06**; referencia también para el reto 27.

> **Actualización en curso:** se está preparando la transición de NOVA a Prisma Migrate. El documento describe el sistema SQL anterior; para el estado nuevo y los pasos de transición consultad [Pedidos y Prisma Migrate paso a paso](./PEDIDOS-PRISMA-PASO-A-PASO.md). No se ha migrado ninguna base remota.

## 1. ¿Qué es una migración?

Una migración es un cambio organizado y registrado en la estructura de una base de datos. Puede crear una tabla, añadir una columna, crear un índice o modificar una restricción. Algunas también transforman datos que ya existen.

Imagina que tu tienda empieza con productos que tienen nombre y precio. Más adelante necesitas guardar su género. Cambiar la aplicación no crea por sí solo una columna en PostgreSQL: necesitas aplicar un cambio en la base. Ese cambio puede guardarse como una migración.

Piensa en una migración como un paso numerado de una receta. El **archivo** describe qué hay que hacer; al **ejecutarlo**, la base cambia; una tabla de **historial** registra que ya se aplicó. Guardar el archivo por sí solo no modifica la base de datos.

## 2. ¿Por qué guardar un historial?

Tu proyecto puede tener varias bases independientes: una en tu ordenador, otra para pruebas y otra para producción. También puede haber más personas desarrollando. El historial permite que cada base reciba los mismos cambios en el mismo orden, sin que tengas que recordar qué comandos ejecutaste manualmente.

Ejemplo conceptual:

| Orden | Archivo | Resultado |
| --- | --- | --- |
| 1 | `001_initial.sql` | Crea las tablas iniciales. |
| 2 | `002_add_gender.sql` | Añade el género al producto. |
| 3 | `003_add_brand.sql` | Añade una marca, si el proyecto la necesita. |

Cada base mantiene su propio registro. Aplicar una migración en tu ordenador **no la aplica** automáticamente a la base de producción.

## 3. Cómo funciona normalmente

1. Decides el cambio y creas una migración nueva; según la herramienta, escribes SQL o la herramienta lo genera.
2. Revisas el contenido: ¿añade, modifica o elimina datos? ¿Funciona con las filas que ya existen?
3. La pruebas en una base de desarrollo o de pruebas.
4. Guardas el archivo en Git junto con los cambios de aplicación que lo necesitan.
5. Al desplegar, aplicas las migraciones pendientes a la base del entorno correspondiente y compruebas el resultado.

El ejecutor consulta el historial de esa base y aplica las migraciones pendientes. En general, evita modificar o borrar migraciones que ya se hayan aplicado y compartido: crea una nueva para corregirlas. Si una migración elimina una columna o transforma datos, planifica la copia de seguridad, la recuperación y la compatibilidad entre las versiones de la aplicación.

Una **transacción de base de datos**, cuando la herramienta y las operaciones la permiten, agrupa cambios para que se confirmen juntos o se deshagan ante un error. No todas las herramientas o bases ejecutan todas las operaciones de migración de la misma forma.

## 4. Cómo funciona en NOVA

NOVA utiliza Prisma Client para consultas, pero sus migraciones actuales son **archivos SQL propios**, no migraciones de Prisma Migrate:

- `db/migrations/`: guarda los archivos SQL. `001_initial.sql` crea la estructura inicial y `002_product_gender.sql` añade el género.
- `scripts/migrate.ts`: lee los archivos `.sql` por orden de nombre y ejecuta los que no figuran en el historial.
- `schema_migrations`: tabla de PostgreSQL donde ese script registra el nombre y la fecha de aplicación de cada archivo.
- `prisma/schema.prisma`: describe los modelos para Prisma Client. Hay que mantenerlo alineado con las tablas reales.

El script de NOVA obtiene un bloqueo de PostgreSQL para evitar que dos ejecuciones del migrador trabajen a la vez. Ejecuta las migraciones pendientes y sus registros en una transacción. Para el flujo concreto consulta `scripts/migrate.ts`.

### Un ejemplo real: género del producto

La migración `002_product_gender.sql` contiene:

```sql
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'MIX');
ALTER TABLE products ADD COLUMN gender "Gender" NOT NULL DEFAULT 'MIX';
```

La primera sentencia define una lista cerrada de valores en PostgreSQL. La segunda añade la columna `gender` a `products`, exige que tenga valor y establece `MIX` como valor predeterminado; así las filas existentes reciben ese valor al añadirla. El modelo `Product` de `schema.prisma` también declara `gender` y su enum correspondiente.

Esto prepara los datos, pero no crea automáticamente una sección de mujer ni un selector en el formulario: esas funcionalidades se desarrollan en la aplicación.

### Comandos de NOVA

Para aplicar las migraciones pendientes a la base indicada en el `.env` local:

```powershell
npm run db:migrate
```

Para regenerar los tipos y el cliente después de cambiar el esquema de Prisma:

```powershell
npm run prisma:generate
```

Son pasos distintos: el primero puede cambiar la base; el segundo genera archivos de cliente y **no modifica tablas**. Antes de ejecutar el migrador, comprueba qué entorno apunta `DATABASE_URL`. No pegues contraseñas de conexión en documentos o conversaciones. Para los entornos desplegados, consulta `docs/VERCEL.md` y las instrucciones de despliegue del proyecto.

La migración 002 se probó en la base local aislada de pruebas durante esta implementación. Eso no demuestra que se haya aplicado a otras bases: cada una tiene su propio historial.

### Añadir otro campo en NOVA

Por ejemplo, para añadir una marca opcional:

1. Diseña el cambio y considera qué valor tendrán los productos existentes.
2. Añade un nuevo archivo SQL con el siguiente nombre ordenado dentro de `db/migrations`. No modifiques `002` si ya se aplicó.
3. Actualiza `prisma/schema.prisma` para reflejar la estructura nueva y genera el cliente.
4. Aplica la migración a una base local de pruebas y comprueba tanto los datos anteriores como la aplicación.
5. Guarda migración, esquema y código juntos en Git. Aplica la migración revisada en cada entorno que la necesite.

## 5. ¿Cómo lo haría en un proyecto nuevo con Prisma Migrate?

Prisma Migrate es una herramienta que genera y aplica migraciones a partir del esquema Prisma. El flujo siguiente es una referencia para **Prisma ORM 7** con una base relacional; otras versiones o bases pueden tener diferencias. Configura primero Prisma y una conexión a una base de desarrollo desechable.

1. Define o modifica tus modelos en `prisma/schema.prisma`.
2. Crea y aplica una migración en desarrollo:

   ```powershell
   npx prisma migrate dev --name init
   ```

   Para cambios posteriores, el nombre puede describir el cambio, como `add_product_brand`. Prisma genera un archivo SQL en `prisma/migrations` y registra las migraciones aplicadas en `_prisma_migrations`. `migrate dev` es para desarrollo y necesita una base auxiliar (*shadow database*).
3. Revisa el SQL generado y súbelo a Git. Para revisar antes de aplicarlo puedes usar `npx prisma migrate dev --name add_product_brand --create-only`; después de revisarlo, aplica la migración en desarrollo con `npx prisma migrate dev`.
4. Genera el cliente: `npx prisma generate`. En Prisma 7, `migrate dev` ya no lo genera automáticamente.
5. Para aplicar migraciones ya creadas y revisadas en una base de pruebas o producción, utiliza `npx prisma migrate deploy`, en el entorno y conexión correctos. No uses `migrate dev` en producción.

`prisma db push` sincroniza el esquema sin crear un historial de migraciones y sirve para algunos flujos de prototipado; no equivale a mantener un historial con Prisma Migrate.

## 6. ¿Y si el proyecto ya tiene una base con datos?

Antes de introducir una herramienta nueva, comprueba la estructura real de cada base, su historial, las diferencias entre entornos y cómo recuperar los datos. No asumas que una migración inicial puede crear tablas que ya existen.

En Prisma Migrate, el proceso llamado **baseline** crea un punto de partida para una base existente: se prepara una migración inicial que represente su estado y se marca como aplicada en las bases que ya tienen esa estructura. La herramienta puede aplicar las migraciones posteriores. Marcarla como aplicada registra una decisión: no comprueba por sí solo que todos los objetos y datos coincidan.

Prueba el procedimiento primero con una copia o una base aislada y sigue la documentación oficial de la versión instalada. Si ya existe otro sistema de migraciones, como en NOVA, hay que acordar cómo transferir el control y evitar que ambos sistemas apliquen cambios contradictorios. **NOVA no se ha cambiado a Prisma Migrate**; no ejecutes el flujo del apartado anterior sobre sus bases actuales como si estuvieran vacías.

## 7. Dudas frecuentes

- **¿Una migración es lo mismo que un seed?** No. Una migración normalmente cambia estructura; un seed inserta datos iniciales o de ejemplo. Una migración también puede transformar datos si el cambio lo requiere.
- **¿Una migración equivale a una copia de seguridad?** No. El historial no garantiza que puedas recuperar datos borrados o alterados.
- **¿Si cambio `schema.prisma` ya cambia la base?** No. Actualizar el esquema y generar el cliente son pasos distintos de aplicar una migración.
- **¿Puedo deshacer siempre una migración?** No necesariamente. Algunas herramientas tienen mecanismos de reversión, pero pueden requerir SQL adicional y no recuperan automáticamente datos perdidos. En NOVA, el script actual aplica pendientes; no implementa una reversión automática.
- **¿Tengo que aplicar las migraciones en orden?** Sí: una posterior puede depender de una tabla o columna creada anteriormente. Cada base registra sus propios avances.

## Para seguir aprendiendo

- [Prisma Migrate para comenzar con Prisma 7](https://www.prisma.io/docs/orm/v7/prisma-migrate/getting-started)
- [Desarrollo y producción con Prisma Migrate 7](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/development-and-production)
- [Crear un baseline para una base existente](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/baselining)
- [Referencia del comando migrate dev de Prisma 7](https://www.prisma.io/docs/cli/v7/migrate/dev)
