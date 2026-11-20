import 'server-only';
import { db } from '@/lib/db';

export async function recordLoginAttempt(key: string) {
  const { rows } = await db.query<{ attempts: number }>(
    `INSERT INTO login_attempts(key,attempts,window_start) VALUES($1,1,now())
     ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN login_attempts.window_start<now()-interval '15 minutes' THEN 1 ELSE login_attempts.attempts+1 END,
     window_start=CASE WHEN login_attempts.window_start<now()-interval '15 minutes' THEN now() ELSE login_attempts.window_start END RETURNING attempts`,
    [key],
  );
  return rows[0].attempts;
}

export async function findAdminByEmail(email: string) {
  const { rows } = await db.query<{ id: string; password_hash: string }>(
    'SELECT id,password_hash FROM users WHERE email=$1 AND role=$2',
    [email, 'admin'],
  );
  return rows[0];
}

export async function createSession(
  tokenHash: string,
  userId: string,
  expiresAt: Date,
  attemptKey: string,
) {
  await db.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)', [
    tokenHash,
    userId,
    expiresAt,
  ]);
  await db.query("DELETE FROM login_attempts WHERE key=$1 OR window_start<now()-interval '1 day'", [
    attemptKey,
  ]);
  await db.query('DELETE FROM sessions WHERE expires_at<=now()');
}

export async function deleteSession(tokenHash: string) {
  await db.query('DELETE FROM sessions WHERE token_hash=$1', [tokenHash]);
}

export async function findSession(tokenHash: string) {
  const { rows } = await db.query<{ id: string; email: string }>(
    `SELECT u.id,u.email FROM sessions s JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=$1 AND s.expires_at>now() AND u.role='admin'`,
    [tokenHash],
  );
  return rows[0] ?? null;
}
