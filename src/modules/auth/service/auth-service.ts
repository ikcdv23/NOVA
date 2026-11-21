import 'server-only';
import { randomBytes } from 'node:crypto';
import { digest, dummyHash, verifyPassword } from '../password';
import * as repository from '../repository/auth-repository';

export async function authenticate(email: string, password: string) {
  const key = digest(email);
  if ((await repository.recordLoginAttempt(key)) > 5)
    return { error: 'Demasiados intentos. Vuelve a intentarlo en 15 minutos.' };
  const admin = await repository.findAdminByEmail(email);
  const valid = await verifyPassword(password, admin?.password_hash ?? dummyHash);
  if (!valid || !admin) return { error: 'Correo o contraseña incorrectos.' };
  const token = randomBytes(32).toString('hex');
  await repository.createSession(
    digest(token),
    admin.id,
    new Date(Date.now() + 8 * 60 * 60 * 1000),
    key,
  );
  return { token };
}

export async function revokeSession(token: string) {
  await repository.deleteSession(digest(token));
}

export async function findSession(token: string) {
  return repository.findSession(digest(token));
}
