'use client';
import { useActionState } from 'react';
import { login } from './actions';
export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="login-form">
      <label>
        Correo electrónico
        <input type="email" name="email" required autoComplete="username" maxLength={254} />
      </label>
      <label>
        Contraseña
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          maxLength={128}
        />
      </label>
      <button className="button" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar al archivo ↗'}
      </button>
      {state.error && (
        <p className="error-text" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
