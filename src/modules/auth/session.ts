import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, isDemo } from '@/lib/db';
import { digest } from './password';
export const cookieName = 'nova_session';
export async function currentAdmin() {
  if (isDemo()) return null;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { rows } = await db.query<{ id: string; email: string }>(
    `SELECT u.id,u.email FROM sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=$1 AND s.expires_at>now() AND u.role='admin'`,
    [digest(token)],
  );
  return rows[0] ?? null;
}
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
