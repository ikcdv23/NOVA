import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isDemo } from '@/lib/db';
import { findSession } from './service/auth-service';
// Stable across visual rebrands; changing it would sign out existing sessions.
export const cookieName = 'nova_session';

export async function currentAdmin() {
  if (isDemo()) return null;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return findSession(token);
}
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}
