# D Bamba

Tienda de ropa masculina nueva y vintage, reutilizable como plantilla. Next.js 16, TypeScript y App Router; monolito modular con PostgreSQL y fotografías en un bucket S3-compatible. El carrito termina en una solicitud al WhatsApp **+34 695 056 234**. No se cobra ni se reserva stock automáticamente.

## Identidad y frontend

Marca y contacto en `src/config/store.ts`; firma compartida en `src/components/brand/`. La portada compone secciones de `src/components/home/`. `globals.css` importa los estilos por responsabilidad desde `src/styles/`.

Dirección visual: fotografía de campaña, negro/blanco y tipografía de moda urbana, con Represent como referencia. La imagen `bamba-campaign.webp` se generó para esta propuesta; el catálogo de ejemplo y los contactos pendientes deben sustituirse antes de abrir la tienda. Se conservan rutas, módulos, SQL, sesiones y carritos existentes.

## Vercel y configuración del entorno

El despliegue activo usa **Vercel + Neon**. La configuración, las variables que necesita la app, la exportación de entornos y los pasos pendientes de Amazon S3 están en [docs/VERCEL.md](docs/VERCEL.md).

Usa **pnpm** y `pnpm-lock.yaml` en este repositorio. `vercel.json` fija `pnpm install --frozen-lockfile` y `pnpm run build` para que Vercel use el mismo flujo que local y CI.

Vercel despliega automáticamente solo `main`. Las previews están desactivadas en el proyecto; las ramas `dev`, `feature/*`, `fix/*` y `chore/*` se revisan con las comprobaciones de GitHub, sin generar despliegues automáticos.

`.env` es la configuración local. Las exportaciones de Vercel se guardan en `.vercel/development.env`, `.vercel/preview.env` y `.vercel/production.env`, fuera de la carga automática de Next.js. Los archivos reales y `.vercel/` están excluidos de Git; `.env.example` y `.env.production.example` son las plantillas públicas.

## Inicio rápido: demo sin servicios

Necesitas Node.js 22 o superior y pnpm (probado con la versión 12). Desde la raíz:

```sh
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

En PowerShell, usa `Copy-Item .env.example .env` en lugar de `cp`. Abre http://localhost:3000. `DEMO_MODE=true` utiliza las prendas de ejemplo y deshabilita el acceso privado. El carrito, los filtros y la preparación del mensaje funcionan en demo. No hay credenciales de administrador predeterminadas.

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

Se utiliza Webpack de Next para evitar restricciones de enlaces de Turbopack en algunos entornos Windows. Las fuentes y fotografías de ejemplo se incluyen localmente; las imágenes de catálogo se optimizan con Next Image.

## Modo real: PostgreSQL y S3

1. Arranca Docker Desktop y ejecuta `docker compose up -d`. Incluye PostgreSQL en 5433 y MinIO en 9000, ambos restringidos a localhost. El puerto 5433 evita conflictos con otros PostgreSQL en el puerto habitual 5432; debe coincidir con el puerto de `DATABASE_URL` en `.env`.
2. Abre la consola de MinIO en http://localhost:9001, usa las credenciales locales de `.env.example` y crea el bucket **nova-images**, privado. No uses esas credenciales en producción.
3. En `.env`, cambia `DEMO_MODE=false`. Las otras variables de ejemplo conectan con estos servicios locales.
4. Ejecuta `pnpm db:migrate`. Aplica las migraciones SQL una sola vez, en transacción, con un bloqueo entre despliegues concurrentes.
5. Opcional: `pnpm db:seed`. Inserta ocho prendas sin sobrescribir las existentes. Sus imágenes de ejemplo se sirven desde `public/images`.
6. Crea tu administrador como se explica abajo y reinicia `pnpm dev`.

También puedes usar un PostgreSQL y un S3-compatible externos sin Docker. Configura sus conexiones en `.env`. El bucket debe existir antes de subir fotografías. El navegador obtiene las imágenes de S3 mediante URL firmada temporal; no necesita acceso de escritura ni credenciales.

## Primer administrador

En el `.env` local, rellena temporalmente:

```dotenv
ADMIN_EMAIL=tu-correo@tu-dominio.es
ADMIN_PASSWORD=una-contrasena-larga-unica-de-al-menos-14-caracteres
```

Ejecuta `pnpm admin:create` y entra en `/admin/login`. El comando admite entre 8 y 128 caracteres; se recomienda una contraseña única de al menos 14. Guarda un hash scrypt con sal aleatoria y rechaza correos existentes. Elimina `ADMIN_PASSWORD` del entorno después. No hay registro público ni recuperación por correo. Para revocar sesiones, elimina las filas de `sessions` del usuario; para recuperar acceso, crea otro administrador desde un entorno autorizado.

Flujo de inventario: crear borrador → añadir hasta cinco fotos → elegir principal → publicar. Las tallas tienen existencias independientes. Ocultar retira la prenda del catálogo; eliminar requiere confirmación. Al borrar la última foto la prenda se oculta. Para confirmar una venta acordada por WhatsApp, edita manualmente las unidades de la talla correspondiente y guarda.

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `DEMO_MODE` | `true` solo para demo; `false` para PostgreSQL y administración. Nunca se activa automáticamente ante errores de conexión. |
| `DATABASE_URL` | Conexión PostgreSQL del servidor. |
| `DATABASE_CA_CERT` | CA PEM opcional, con saltos `\n`, para conexiones TLS que la requieran. No se desactiva la verificación del certificado. |
| `NEXT_PUBLIC_SITE_URL` | URL pública para metadatos; configúrala antes de compilar. |
| `S3_ENDPOINT` | Endpoint base del proveedor, sin nombre de bucket. |
| `S3_REGION` | Región que indique el proveedor. |
| `S3_BUCKET` | Nombre real del bucket en la API S3. |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Credenciales privadas del servidor, con acceso Get/Put/Delete al bucket. |
| `S3_FORCE_PATH_STYLE` | `true` en MinIO; en Railway sigue el estilo indicado en sus credenciales. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Solo para el comando de alta inicial. |
| `PORT` | Puerto de escucha; Railway lo proporciona automáticamente. |

No añadas el prefijo `NEXT_PUBLIC_` a secretos. No se necesita un secreto de JWT: la sesión es un token aleatorio de 256 bits, guardado solo como SHA-256 en PostgreSQL.

`APP_URL` no se usa. Las variables adicionales `PG*`, `POSTGRES_*` y `NEON_*` que añade Neon pueden conservarse en Vercel; el acceso a datos de NOVA utiliza `DATABASE_URL`. `ADMIN_EMAIL` y `ADMIN_PASSWORD` se usan únicamente en el alta inicial, no para iniciar sesión ni como credenciales permanentes del despliegue.

## Desplegar en Railway

El proyecto está preparado; no crea recursos ni publica nada por sí mismo.

1. Sube el código, `pnpm-lock.yaml` y `pnpm-workspace.yaml` a tu repositorio, excluyendo `.env`, `.qa`, `.next` y `node_modules`.
2. Crea un proyecto Railway con un servicio PostgreSQL, un bucket y un servicio desde el repositorio de la aplicación.
3. En las variables de la aplicación establece `DEMO_MODE=false`, `DATABASE_URL=${{Postgres.DATABASE_URL}}` (adapta el nombre del servicio) y `NEXT_PUBLIC_SITE_URL` con el dominio asignado.
4. Conecta las credenciales del bucket a las variables de esta app:

   | App | Referencia de Railway (bucket llamado `Images`) |
   | --- | --- |
   | `S3_ENDPOINT` | `${{Images.ENDPOINT}}` |
   | `S3_REGION` | `${{Images.REGION}}` |
   | `S3_BUCKET` | `${{Images.BUCKET}}` |
   | `S3_ACCESS_KEY_ID` | `${{Images.ACCESS_KEY_ID}}` |
   | `S3_SECRET_ACCESS_KEY` | `${{Images.SECRET_ACCESS_KEY}}` |

   Usa `S3_FORCE_PATH_STYLE=false` para los buckets actuales con virtual-hosted URLs, o `true` si la pestaña de credenciales exige path style. No utilices el nombre visible `RAILWAY_BUCKET_NAME` como nombre S3. El bucket permanece privado. [Documentación de buckets](https://docs.railway.com/storage-buckets).
5. `railway.json` configura build `npm run build`, predeploy `npm run railway:migrate`, inicio `npm start` y healthcheck `/api/health`. Railpack instala las dependencias con pnpm a partir de `pnpm-lock.yaml`; esos comandos solo ejecutan scripts, por lo que no dependen del gestor usado para instalar. Se conserva la instalación completa de dependencias de ejecución; no se requiere un volumen para Next. Las migraciones y `tsx` están disponibles en el servicio.
6. Genera el dominio, configura su URL y despliega. El predeploy necesita acceso a PostgreSQL. No incluyas el seed ni el alta de usuarios en los reinicios automáticos.
7. En una shell **dentro del servicio** (por ejemplo `railway ssh`), proporciona temporalmente `ADMIN_EMAIL` y `ADMIN_PASSWORD` y ejecuta `npx tsx scripts/create-admin.ts`. Retira la contraseña del entorno. El comando de Railway no depende de un archivo `.env`.
8. Si quieres ejemplos en esa base, ejecuta una vez `npx tsx scripts/seed.ts` en el mismo servicio. Luego sustitúyelos desde el panel.

`railway run` desde tu ordenador no convierte la red privada de Railway en una conexión local: si ejecutas scripts fuera del servicio, necesitas la URL pública/proxy de PostgreSQL. Guía de referencia: [Next.js y PostgreSQL en Railway](https://railway.com/guides/nextjs).

## Arquitectura

```text
src/app/                 Rutas, layouts, metadatos, errores y healthcheck
src/components/          Componentes visuales, agrupados por funcionalidad
src/modules/catalog/     Lectura pública, filtros y datos demo
src/modules/cart/        Carrito local, validación y mensaje WhatsApp
src/modules/auth/        Hashes, sesiones, limitación de acceso y login
src/modules/admin/       Validación y escrituras de inventario
src/modules/media/       Subida validada, S3, principal y limpieza
src/config/store.ts      Marca, WhatsApp, correo y redes
src/lib/db.ts            Pool PostgreSQL y transacciones
db/migrations/           Esquema SQL versionado
scripts/                 Migración, seed, creación de admin y mantenimiento
tests/                   Pruebas de lógica y recorridos de navegador
```

Las páginas y layouts permanecen en `src/app/` por las convenciones de Next.js;
los componentes visuales están en `src/components/`. Cada funcionalidad se
organiza en `src/modules/` con las capas que necesita:

- `actions/`: recibe solicitudes, valida la entrada, comprueba permisos y actualiza la vista.
- `service/`: contiene las reglas y coordina operaciones y transacciones.
- `repository/`: concentra las consultas a PostgreSQL.

Las páginas de catálogo leen directamente del servicio: no necesitan una acción
para mostrar datos. El carrito vive en el navegador y consulta el catálogo antes
de preparar WhatsApp, por lo que no tiene repositorio propio. La app usa SQL con
`pg`; Prisma Client está configurado para una migración gradual. Las migraciones
SQL de `db/migrations/` siguen siendo la fuente de verdad de la base de datos.

El stock vive en `variants`, por prenda y talla. El precio es un entero de céntimos. El catálogo usa exclusivamente prendas publicadas; las lecturas son dinámicas y las mutaciones invalidan las rutas. El navegador guarda solo identificadores, tallas y cantidades: el servidor vuelve a comprobar publicación, tallas, precios y disponibilidad al preparar WhatsApp. No escribe pedidos, no reserva unidades y nunca decrementa stock.

El filtrado se realiza sobre el conjunto publicado en el servidor, adecuado para una boutique. Para grandes inventarios, sustituirlo por filtros SQL y paginación conservando las interfaces del módulo.

## Protección y fotografías

Todas las escrituras comprueban sesión y rol en el servidor, incluso invocadas directamente. El panel y sus lecturas privadas también requieren autenticación. La cookie es HttpOnly, SameSite=Lax, Secure en producción y caduca a las ocho horas. El servidor valida los formularios con Zod, usa parámetros SQL y limita el login a cinco intentos por cuenta en quince minutos, de forma compartida entre réplicas. Las acciones POST conservan la verificación de origen de Next. [Modelo de autenticación de Next](https://nextjs.org/docs/app/guides/authentication).

Las subidas admiten JPG/PNG/WebP estáticos de hasta 5 MB y 25 megapíxeles. Sharp inspecciona y recodifica a WebP, limita dimensiones y elimina metadatos; los nombres S3 son UUID. Un bloqueo de la prenda impide superar cinco imágenes con subidas concurrentes. Las fotos de prendas ocultas solo se firman para administradores. Una URL ya firmada puede seguir funcionando hasta su expiración de cinco minutos.

La eliminación del registro y la cola de limpieza son transaccionales. Ejecuta **Limpiar archivos pendientes** en el panel o `pnpm media:cleanup` localmente (`npx tsx scripts/cleanup-media.ts` en Railway) para retirar objetos de S3. Los intentos fallidos quedan en cola para reintentar. Las subidas interrumpidas dejan un registro recuperable que se puede limpiar después de una hora. La limpieza no elimina objetos todavía referenciados. Programa el comando de mantenimiento en Railway si necesitas limpieza periódica.

## Reutilizar para otro cliente

- Cambia marca, contacto y redes en `src/config/store.ts`. El correo `.example` y el enlace general de Instagram deben sustituirse.
- Ajusta colores y tipografía en `src/styles/tokens.css`, y sustituye los textos de inicio, historia y contacto.
- Sustituye `public/images` y las prendas de `src/modules/catalog/demo.ts`, o administra contenido real con el panel. Los dos últimos ejemplos reutilizan imágenes del conjunto.
- Configura una base y un bucket distintos por cliente. No reutilices usuarios o secretos.
- Sustituye la nota demostrativa por la información real y añade los textos legales específicos del negocio antes de abrirlo al público.

Las siete imágenes de producto y la campaña de D Bamba se generaron con IA para esta propuesta. Prompts y dirección visual en `docs/DESIGN.md`.

Pruebas reproducibles en [docs/TESTING.md](docs/TESTING.md) y resultados de esta entrega en [docs/VERIFICATION.md](docs/VERIFICATION.md).

## Incluido y fuera de alcance

Incluido: inicio editorial responsive; ambas colecciones; búsqueda y filtros; ficha con galería, medidas y stock; historia y contacto; carrito persistente; solicitud WhatsApp; login privado; CRUD, ocultación y publicación; cinco fotos con principal y borrado; esquema y migraciones; seed; configuración de Railway.

Fuera de alcance: **pagos online, pedidos automáticos, gestión de envíos y facturación**. Tampoco hay cuentas de compradores, recuperación de contraseña por email, integración con WhatsApp Business API ni sincronización con marketplaces. El WhatsApp se abre con el mensaje preparado: el cliente decide enviarlo y la tienda confirma manualmente.
