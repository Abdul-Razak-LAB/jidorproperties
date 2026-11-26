import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { hasDatabase, prisma } from '@/lib/prisma';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminSessionToken } from '@/lib/adminSession';

export async function GET() {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ needsSetup: false, error: 'Database not configured' }, { status: 503 });
  }

  const userCount = await prisma.user.count();
  return NextResponse.json({ needsSetup: userCount === 0 });
}

export async function POST(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 });
  }
  const { email, password } = await req.json();
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  });
  if (!user || !user.passwordHash) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });
  if (user.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'This account is not authorized for admin access.' }, { status: 403 });
  }

  const response = NextResponse.json({ id: user.id, email: user.email });
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken({ id: user.id, email: user.email }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}
