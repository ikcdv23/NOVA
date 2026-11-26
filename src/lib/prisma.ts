import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma-client/client';

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Un pool por instancia se multiplica por las instancias concurrentes de
  // Vercel: con el máximo por defecto (diez) una ráfaga agota las conexiones de
  // Postgres y las peticiones esperan de pie antes de empezar a trabajar. Cada
  // consulta ocupa la conexión milisegundos, así que un pool pequeño basta y
  // conviene usar la cadena con pooler de Neon.
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10_000,
  }),
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
