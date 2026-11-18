# Prisma en NOVA

Este directorio sirve para aprender y documentar el esquema de PostgreSQL de NOVA.

## Estado actual

- Prisma está instalado solo como herramienta de desarrollo.
- `schema.prisma` describe las tablas que ya crea
  `db/migrations/001_initial.sql`.
- NOVA sigue usando `pg` mediante `src/lib/db.ts`.
- Las rutas, el catálogo, la administración y las migraciones actuales no usan
  Prisma.

Por tanto, añadir o editar este esquema no modifica la base de datos ni cambia
el funcionamiento de la tienda.

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

## Comandos seguros ahora

Desde la raíz del repositorio:

```powershell
npx prisma validate
```

Este comando solo comprueba la sintaxis y las relaciones del archivo de esquema.
No crea tablas, no aplica migraciones y no genera código de aplicación.

## No ejecutar todavía

No ejecutes `prisma migrate dev`, `prisma migrate deploy`, `prisma db push`
ni `prisma generate` como parte de NOVA. El proyecto ya tiene un sistema de
migraciones SQL en `db/migrations/`, y mezclar ambos sistemas sin una
migración planificada puede desalinear el historial de la base de datos.

## Siguiente paso cuando quieras integrar Prisma

Primero se decide si Prisma sustituirá el acceso con `pg` o solo se usará para
consultas nuevas. Después se prepara una migración de referencia de la base de
datos existente, se añade Prisma Client y se cambia una consulta pequeña con
pruebas. Hasta entonces, este directorio es documentación y práctica aislada.
