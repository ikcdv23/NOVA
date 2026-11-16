import Link from 'next/link';
import { requireAdmin } from '@/modules/auth/session';
import { logout } from '@/modules/auth/actions';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Administración', robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="admin-wrap" data-ui>
      <div className="admin-bar">
        <Link href="/admin">NOVA Archive / Inventario</Link>
        <div>
          <span>{admin.email}</span>
          <form action={logout}>
            <button className="text-button">Cerrar sesión</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
