import { redirect } from 'next/navigation';
import { currentAdmin } from '@/modules/auth/session';
import { LoginForm } from '@/components/auth/login-form';
import { isDemo } from '@/lib/db';
export const metadata = { title: 'Acceso privado', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default async function Login() {
  if (await currentAdmin()) redirect('/admin');
  return (
    <div className="page-wrap login-page" data-ui>
      <div>
        <h1>Acceso privado</h1>
        <p>El inventario, entre bastidores.</p>
        {isDemo() && (
          <p className="notice">
            Estás en modo demo. Para administrar prendas, configura PostgreSQL, desactiva DEMO_MODE
            y crea tu usuario con <code>npm run admin:create</code>.
          </p>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
