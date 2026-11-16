import { Pool, type PoolClient } from 'pg';
const globalDb = globalThis as unknown as { novaPool?: Pool };
export const db =
  globalDb.novaPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    ...(process.env.DATABASE_CA_CERT
      ? {
          ssl: { rejectUnauthorized: true, ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n') },
        }
      : {}),
  });
if (process.env.NODE_ENV !== 'production') globalDb.novaPool = db;
export const isDemo = () => process.env.DEMO_MODE === 'true';
export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const value = await work(client);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
