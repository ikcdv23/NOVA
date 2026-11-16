import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '../src/lib/db';
import { hashPassword } from '../src/modules/auth/password';
try {
  const email = z.email().max(254).parse(process.env.ADMIN_EMAIL?.trim().toLowerCase());
  const password = z
    .string()
    .min(8, 'Use at least 8 characters')
    .max(128)
    .parse(process.env.ADMIN_PASSWORD);
  await db.query('INSERT INTO users(id,email,password_hash) VALUES($1,$2,$3)', [
    randomUUID(),
    email,
    await hashPassword(password),
  ]);
  console.log('Administrator created. Remove ADMIN_PASSWORD from your environment.');
} catch (error) {
  console.error(
    error instanceof Error && 'code' in error && error.code === '23505'
      ? 'This email already exists. No password was changed.'
      : 'Could not create admin. Check database, email and password (8–128 characters).',
  );
  process.exitCode = 1;
} finally {
  await db.end();
}
