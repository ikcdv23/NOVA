'use server';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db, isDemo } from '@/lib/db';
import { digest, dummyHash, verifyPassword } from './password';
import { cookieName } from './session';
export type LoginState = { error?: string };
export async function login(_state: LoginState, form: FormData): Promise<LoginState> {
  if (isDemo())
    return { error: 'El acceso privado requiere desactivar DEMO_MODE y configurar PostgreSQL.' };

  const parsed = z
    .object({ email: z.email().max(254), password: z.string().min(1).max(128) })
    .safeParse({
      email: String(form.get('email') ?? '')
        .trim()
        .toLowerCase(),
      password: form.get('password'),
    });
  if (!parsed.success) return { error: 'Revisa el correo y la contraseña.' };
  const { email, password } = parsed.data;
  try {
    // Atomic account-based throttle shared across every Railway replica. No client-supplied IP is trusted.
    const key = digest(email);
    const { rows: attempts } = await db.query<{ attempts: number }>(
      `INSERT INTO login_attempts(key,attempts,window_start) VALUES($1,1,now())
      ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN login_attempts.window_start<now()-interval '15 minutes' THEN 1 ELSE login_attempts.attempts+1 END,
      window_start=CASE WHEN login_attempts.window_start<now()-interval '15 minutes' THEN now() ELSE login_attempts.window_start END RETURNING attempts`,
      [key],
    );    
    if (attempts[0].attempts > 5)
      return { error: 'Demasiados intentos. Vuelve a intentarlo en 15 minutos.' };
    const { rows } = await db.query<{ id: string; password_hash: string }>(
      'SELECT id,password_hash FROM users WHERE email=$1 AND role=$2',
      [email, 'admin'],
    );
    const valid = await verifyPassword(password, rows[0]?.password_hash ?? dummyHash);
    if (!valid || !rows[0]) return { error: 'Correo o contraseña incorrectos.' };
    const token = randomBytes(32).toString('hex');
    await db.query('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)', [
      digest(token),
      rows[0].id,
      new Date(Date.now() + 8 * 60 * 60 * 1000),
    ]);
    await db.query(
      "DELETE FROM login_attempts WHERE key=$1 OR window_start<now()-interval '1 day'",
      [key],
    );
    await db.query('DELETE FROM sessions WHERE expires_at<=now()');
    (await cookies()).set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });
  } catch {
    return { error: 'No se ha podido iniciar sesión. Comprueba la conexión con la base de datos.' };
  }
  redirect('/admin');
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token && !isDemo())
    await db.query('DELETE FROM sessions WHERE token_hash=$1', [digest(token)]);
  jar.delete(cookieName);
  redirect('/admin/login');
}
