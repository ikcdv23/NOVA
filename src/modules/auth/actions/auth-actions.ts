'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { isDemo } from '@/lib/db';
import { authenticate, revokeSession } from '../service/auth-service';
import { cookieName } from '../session';
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
    const result = await authenticate(email, password);
    if (result.error) return { error: result.error };
    const token = result.token!;
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
  if (token && !isDemo()) await revokeSession(token);
  jar.delete(cookieName);
  redirect('/admin/login');
}
