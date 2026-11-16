// Isolated, local-only PostgreSQL for development verification; never uses DATABASE_URL.
import EmbeddedPostgres from 'embedded-postgres';
import { resolve } from 'node:path';
import { mkdir, access } from 'node:fs/promises';
const directory = resolve('.qa/postgres');
await mkdir(resolve('.qa'), { recursive: true });
const pg = new EmbeddedPostgres({
  databaseDir: directory,
  user: 'nova_qa',
  password: 'local_qa_only',
  port: 55439,
  persistent: true,
  postgresFlags: ['-h', '127.0.0.1'],
  onLog: () => {},
  onError: () => {},
});
try {
  await access(resolve(directory, 'PG_VERSION'));
} catch {
  await pg.initialise();
}
await pg.start();
const client = pg.getPgClient();
await client.connect();
if (!(await client.query("SELECT 1 FROM pg_database WHERE datname='nova_qa'")).rowCount)
  await pg.createDatabase('nova_qa');
await client.end();
console.log('QA PostgreSQL ready on 127.0.0.1:55439. Press Ctrl+C to stop.');
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await pg.stop();
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
setInterval(() => {}, 30000);
