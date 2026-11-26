import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { hasDatabase, prisma } from '@/lib/prisma';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminSessionToken } from '@/lib/adminSession';

export async function POST(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 });
  }

  const existingUserCount = await prisma.user.count();
  if (existingUserCount > 0) {
    return NextResponse.json({ error: 'Initial admin setup is no longer available.' }, { status: 403 });
  }

  const { email, password, name } = await req.json();
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email.trim().length === 0 ||
    password.length < 10
  ) {
    return NextResponse.json({ error: 'Enter a valid email and a password with at least 10 characters.' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      name: typeof name === 'string' && name.trim() ? name.trim() : 'Administrator',
      role: 'admin',
    },
  });

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
