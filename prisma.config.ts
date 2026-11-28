import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // No se exige DATABASE_URL al cargar la configuración: `prisma generate`
    // también se ejecuta en `npm ci`, donde no hay base de datos. Los comandos
    // que sí la necesitan (migrate deploy) fallarán con un error claro.
    url: process.env.DATABASE_URL ?? '',
  },
});
