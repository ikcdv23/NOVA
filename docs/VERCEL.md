# NOVA en Vercel

## Archivos y entornos

| Archivo | Para qué sirve | ¿Se sube a Git? |
| --- | --- | --- |
| `.env.example` | Plantilla local con PostgreSQL y MinIO de desarrollo; demo activada | Sí |
| `.env.production.example` | Referencia de las variables de la app que se configuran en Vercel, sin secretos | Sí |
| `.env` | Configuración efectiva de esta máquina para Next.js y los scripts npm de mantenimiento | No |
| `.vercel/project.json` | Vinculación local con el proyecto de Vercel | No |
| `.vercel/development.env` | Exportación del entorno Development de Vercel | No |
| `.vercel/preview.env` | Exportación del entorno Preview de Vercel | No |
| `.vercel/production.env` | Exportación del entorno Production de Vercel | No |
| `.vercel/env-backups/` | Copias privadas de los archivos anteriores a la reorganización | No |
| `vercel.json` | Instalación y compilación reproducibles con npm | Sí |
| `.vercelignore` | Exclusión de secretos y archivos locales en despliegues por CLI | Sí |

Next.js carga automáticamente `.env.local` y `.env.production.local` con prioridad sobre `.env`. Por eso las exportaciones de Vercel se guardan dentro de `.vercel/`: descargarlas no cambia la base de datos que utiliza la app local.

Las variables ya presentes en el proceso prevalecen sobre los archivos. En Vercel se usan las variables configuradas para el entorno del despliegue. Cambiar `.env` en tu ordenador no modifica Vercel y exportar variables no las sube ni las sincroniza en sentido inverso.

## Desarrollo local

En una copia nueva, desde la raíz:

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm dev
```

Con `DEMO_MODE=true`, la tienda usa prendas de ejemplo y deshabilita el acceso privado. Para usar PostgreSQL y MinIO locales, sigue el apartado «Modo real» del README y cambia `DEMO_MODE=false` en `.env`.

Los comandos `db:migrate`, `db:seed`, `admin:create` y `media:cleanup` cargan `.env`. No cambies su `DATABASE_URL` por la de producción salvo que quieras que esos comandos actúen sobre esa base.

## Variables que necesita la aplicación en Vercel

| Variable | Configuración |
| --- | --- |
| `DEMO_MODE` | `false` para PostgreSQL y administración. `true` solo para demo. |
| `DATABASE_URL` | La conexión PostgreSQL que proporciona Neon. Nunca `localhost`. |
| `NEXT_PUBLIC_SITE_URL` | Origen público con `https://`, configurado antes de compilar. |
| `DATABASE_CA_CERT` | Opcional; solo si PostgreSQL exige una CA específica. |
| `S3_REGION` | Región real del bucket, necesaria para usar fotos propias. |
| `S3_BUCKET` | Nombre real del bucket privado. |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Credenciales privadas que admite el cliente S3 actual de NOVA. |
| `S3_ENDPOINT` | Endpoint del proveedor S3-compatible. Puede omitirse con Amazon S3 para usar el de la región. |
| `S3_FORCE_PATH_STYLE` | `false` para Amazon S3 habitual; `true` para MinIO local. |

No hace falta añadir `APP_URL`, `PORT`, `NODE_ENV` ni un secreto JWT para este despliegue. `ADMIN_EMAIL` y `ADMIN_PASSWORD` son entradas del comando de alta inicial: no son necesarias para ejecutar la web ni para verificar el login de un administrador ya creado.

Neon añade otras variables (`DATABASE_URL_UNPOOLED`, `PG*`, `POSTGRES_*`, `NEON_*`, etc.). Pueden quedarse en Vercel; no es necesario copiarlas una a una a `.env`. NOVA usa `DATABASE_URL` para sus consultas. La presencia de variables de Neon Auth tampoco sustituye el sistema de sesiones propio de NOVA.

Los valores de ejemplo de MinIO y PostgreSQL locales no funcionan desde Vercel. Solo `NEXT_PUBLIC_SITE_URL` es pública; las credenciales nunca llevan el prefijo `NEXT_PUBLIC_`.

## Vincular y exportar variables

Requiere la CLI de Vercel instalada y una sesión autorizada (`vercel whoami`). En una máquina nueva:

```powershell
vercel link --yes --scope javieralcate-5406s-projects --project nova
```

La vinculación puede crear `.env.local`. Si lo hace, revisa su contenido antes de arrancar: Next.js lo carga automáticamente. Para mantener este esquema, guarda esa descarga en `.vercel/development.env`; conserva como configuración local únicamente `.env`. En una máquina nueva, si todavía no existe la exportación de destino:

```powershell
Move-Item -LiteralPath .env.local -Destination .vercel/development.env
```

Una vez vinculado el proyecto, puedes exportar cada entorno por separado:

```powershell
pnpm env:pull:development
pnpm env:pull:preview
pnpm env:pull:production
```

Por ejemplo, el último ejecuta:

```powershell
vercel env pull .vercel/production.env --environment production
```

Si quieres sobrescribir una exportación existente sin preguntas, añade `-- --yes` al comando pnpm. Algunas variables Secret/Sensitive no permiten recuperar su valor; una exportación no garantiza una copia completa de todos los secretos. Tampoco es una copia de la base de datos ni de las fotografías. Los tokens OIDC exportados son temporales.

No copies una exportación completa a `.env`: puede incluir la conexión de producción, metadatos de un despliegue y tokens que no necesita el desarrollo local.

## Migraciones y despliegue

### Solo se despliega main

Las previews automáticas están desactivadas en la configuración del proyecto de Vercel (`previewDeploymentsDisabled=true`) y la rama de producción es `main`. Este ajuste ya está aplicado y no depende de fusionar esta PR.

El repositorio también guarda la política en `vercel.json`: `git.deploymentEnabled` bloquea todas las ramas mediante `"**": false` y permite expresamente `"main": true`. En Vercel, una regla coincidente con valor `true` permite el despliegue aunque también coincida con la regla general.

Los pushes y las pull requests de `dev`, `feature/*`, `fix/*`, `chore/*` u otras ramas no generan nuevas previews automáticas. Las comprobaciones de GitHub continúan. Al incorporar los cambios a `main`, Vercel publica producción. Los despliegues anteriores siguen en el historial; no se eliminan con esta configuración. La regla controla la automatización de Git, no una orden manual de despliegue por CLI o API.

### Instalación y cambios de esquema

Se usa `pnpm install --frozen-lockfile` con `pnpm-lock.yaml` y `pnpm run build`, que también genera Prisma Client. Las migraciones SQL de `db/migrations/` siguen siendo la fuente de verdad: generar Prisma Client no crea tablas. No uses `prisma db push` ni Prisma Migrate para esta base.

Las compilaciones no ejecutan migraciones, seed ni altas de administrador. Antes de publicar código que necesite un cambio de esquema, aplica únicamente las migraciones revisadas sobre la base elegida. Con una exportación válida de Production:

```powershell
npx tsx --env-file=.vercel/production.env scripts/migrate.ts
```

Este comando **modifica la base de producción**. El ejecutor aplica los SQL pendientes en una transacción con bloqueo y registra los ya aplicados. No crea prendas ni administradores.

En un entorno remoto que ya tenga las variables inyectadas se puede usar `pnpm db:migrate:remote`. `railway:migrate` se conserva por compatibilidad con `railway.json`.

Para crear un administrador en producción, proporciona `ADMIN_EMAIL` y `ADMIN_PASSWORD` temporalmente al proceso y ejecuta `scripts/create-admin.ts` con la exportación de producción. Elimina la contraseña del proceso al terminar. No incluyas el alta ni el seed en cada compilación o reinicio.

Para publicar código, usa una rama y una pull request según [.github/README.md](../.github/README.md). El proyecto ya utiliza la rama `main` en producción. Las variables nuevas o modificadas se aplican a nuevos despliegues: requieren volver a desplegar.

## Estado comprobado el 21 de noviembre de 2026

- Proyecto: `javieralcate-5406s-projects/nova`.
- Dominio de producción: <https://nova-umber-tau.vercel.app>.
- Neon: `neon-coral-engine` conectado a Production, Preview y Development.
- `001_initial.sql` aplicada; el healthcheck del despliegue devolvió `{"status":"ok","mode":"live"}` usando acceso autenticado de Vercel.
- `DEMO_MODE=false` en Production y Preview; `NEXT_PUBLIC_SITE_URL` configurada en Production.
- Previews automáticas desactivadas en el proyecto; solo `main` despliega automáticamente. Las variables del entorno Preview se conservan.
- AWS instalado en la cuenta, sin recurso S3 visible en Vercel y sin variables S3 asociadas a NOVA durante la revisión. Esto no descarta un bucket creado directamente en otra consola de AWS.
- No se ha ejecutado el seed ni creado un administrador de producción durante esta configuración.
- Vercel Authentication está activada con alcance `all_except_custom_domains`. Un despliegue correcto y un healthcheck autenticado no prueban acceso público sin sesión. Revisar Deployment Protection antes de abrir la tienda al público.

La reorganización del repositorio no crea recursos de pago ni publica automáticamente estos cambios. `vercel.json` se aplicará cuando se despliegue esta rama tras la revisión correspondiente.

En esta máquina se guardaron los archivos de entorno anteriores en `.vercel/env-backups/` y se restableció `.env` con la plantilla de demo local. Esto no modifica las variables ni los datos del despliegue de Vercel.

## Qué falta para las fotografías de Amazon

Identificar el bucket y la región y comprobar que la aplicación puede subir, leer y borrar objetos. El almacenamiento debe seguir siendo privado: NOVA entrega las fotos mediante URL firmada temporal.

El cliente actual de `src/modules/media/storage.ts` exige `S3_BUCKET`, `S3_ACCESS_KEY_ID` y `S3_SECRET_ACCESS_KEY`. Instalar AWS en Vercel no configura por sí solo este cliente. Si la integración entrega un rol OIDC (`AWS_ROLE_ARN`) y `S3_BUCKET_NAME`, será necesario adaptar el cliente a ese mecanismo antes de considerarlo conectado; copiar esos nombres no basta.

Hasta que se configure y verifique S3, el catálogo puede leer prendas con imágenes locales de ejemplo, pero la subida y el servicio de fotos propias no están verificados.

## Referencias

- [Variables y exportación con la CLI de Vercel](https://vercel.com/docs/cli/env)
- [Configuración de vercel.json](https://vercel.com/docs/project-configuration/vercel-json)
- [Variables de entorno en Next.js](https://nextjs.org/docs/app/guides/environment-variables)
- [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
