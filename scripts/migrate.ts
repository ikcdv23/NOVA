import { readdir, readFile } from 'node:fs/promises';
import { db, transaction } from '../src/lib/db';
try {
  await transaction(async (c) => {
    await c.query('SELECT pg_advisory_xact_lock(73629201)');
    await c.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz DEFAULT now())',
    );
    const dir = new URL('../db/migrations/', import.meta.url);
    for (const name of (await readdir(dir)).filter((n) => n.endsWith('.sql')).sort()) {
      if ((await c.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name])).rowCount)
        continue;
      await c.query(await readFile(new URL(name, dir), 'utf8'));
      await c.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
      console.log(`Applied ${name}`);
    }
  });
} finally {
  await db.end();
}
