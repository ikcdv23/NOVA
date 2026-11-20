# Prisma en NOVA

Este directorio sirve para aprender y documentar el esquema de PostgreSQL de NOVA.

## Estado actual

- Prisma Client 7 está integrado para PostgreSQL con `@prisma/adapter-pg` y
  se comparte desde `src/lib/prisma.ts`.
- `npm install` y `npm run build` ejecutan `prisma generate`; el cliente
  generado en `src/generated/` no se versiona.
- `schema.prisma` describe las tablas que ya crea
  `db/migrations/001_initial.sql`.
- NOVA conserva `pg` mediante `src/lib/db.ts` en los módulos que aún no se han
  migrado a Prisma.

El cliente tipado no es dueño del esquema: las migraciones SQL existentes
siguen siendo la única vía para modificar la base de datos.

## Qué representa el esquema

| Modelo Prisma | Tabla PostgreSQL | Uso en NOVA |
| --- | --- | --- |
| `Product` | `products` | Prendas del catálogo |
| `Variant` | `variants` | Tallas y existencias |
| `Image` | `images` | Fotos de una prenda |
| `User`, `Session` | `users`, `sessions` | Administración |
| `LoginAttempt` | `login_attempts` | Límite de intentos de acceso |
| `MediaCleanup` | `media_cleanup` | Borrado diferido de archivos S3 |

Los límites SQL existentes, como los valores permitidos para `collection` y
la regla que exige una de `object_key` o `sample_url`, permanecen en
`db/migrations/001_initial.sql`. Prisma los documenta indirectamente, pero
no los sustituye.

## Generar Prisma Client

Desde la raíz del repositorio:

```powershell
npm run prisma:generate
```

Para validar el esquema sin generar código usa `npx prisma validate`.

## No ejecutar

No ejecutes `prisma migrate dev`, `prisma migrate deploy` ni `prisma db push`.
El proyecto ya tiene un sistema de
migraciones SQL en `db/migrations/`, y mezclar ambos sistemas sin una
migración planificada puede desalinear el historial de la base de datos.

## Migración gradual

Migra repositorios uno a uno, conservando la interfaz del servicio. No mezcles
Prisma y `pg` dentro de una misma transacción: cada caso de uso debe elegir un
solo mecanismo de acceso a datos hasta que la migración esté completa.
