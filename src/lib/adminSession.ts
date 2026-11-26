import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_SESSION_COOKIE = 'jidor-admin-session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export type AdminSession = {
  userId: string;
  email: string;
  role: 'admin';
  expiresAt: number;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function signatureFor(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function createAdminSessionToken(user: { id: string; email: string }) {
  const secret = getSessionSecret();
  if (!secret) throw new Error('SESSION_SECRET must contain at least 32 characters.');

  const session: AdminSession = {
    userId: user.id,
    email: user.email,
    role: 'admin',
    expiresAt: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${signatureFor(payload, secret)}`;
}

export function verifyAdminSessionToken(token?: string): AdminSession | null {
  const secret = getSessionSecret();
  if (!secret || !token) return null;

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra) return null;

  const expectedSignature = signatureFor(payload, secret);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expectedSignature);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;
    if (
      !session ||
      typeof session.userId !== 'string' ||
      typeof session.email !== 'string' ||
      session.role !== 'admin' ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect('/login');
  return session;
}
