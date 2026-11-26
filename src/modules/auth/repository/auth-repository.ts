import 'server-only';
import { prisma } from '@/lib/prisma';

export async function recordLoginAttempt(key: string) {
  // Una única consulta atómica evita perder intentos de inicio de sesión simultáneos.
  const rows = await prisma.$queryRaw<{ attempts: number }[]>`
    INSERT INTO login_attempts(key, attempts, window_start) VALUES (${key}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      attempts = CASE WHEN login_attempts.window_start < now() - interval '15 minutes' THEN 1 ELSE login_attempts.attempts + 1 END,
      window_start = CASE WHEN login_attempts.window_start < now() - interval '15 minutes' THEN now() ELSE login_attempts.window_start END
    RETURNING attempts`;
  return rows[0].attempts;
}

export async function findAdminByEmail(email: string) {
  const user = await prisma.user.findFirst({
    where: { email, role: 'admin' },
    select: { id: true, passwordHash: true },
  });
  return user ? { id: user.id, password_hash: user.passwordHash } : undefined;
}

export async function createSession(
  tokenHash: string,
  userId: string,
  expiresAt: Date,
  attemptKey: string,
) {
  await prisma.session.create({ data: { tokenHash, userId, expiresAt } });
  await prisma.loginAttempt.deleteMany({
    where: {
      OR: [
        { key: attemptKey },
        { windowStart: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  });
  await prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } });
}

export async function deleteSession(tokenHash: string) {
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function findSession(tokenHash: string) {
  const session = await prisma.session.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() }, user: { role: 'admin' } },
    select: { user: { select: { id: true, email: true } } },
  });
  return session?.user ?? null;
}
