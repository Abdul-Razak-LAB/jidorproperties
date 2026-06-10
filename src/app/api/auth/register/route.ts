import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { hasDatabase, prisma } from '@/lib/prisma';
import { sendEmailRaw } from '@/lib/email';

export async function POST(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const body = await req.json();
  const { email, password, name } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'user exists' }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash: hash, name } });

  // Create verification token
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await prisma.verificationToken.create({ data: { token, type: 'verify', userId: user.id, expiresAt: expires } });

  // Send verification email via Resend (background this should be queued)
  try {
    const apiKey = process.env.RESEND_API_KEY || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const html = `<p>Welcome ${name || ''}</p><p>Verify your email: <a href="${link}">Verify account</a></p>`;
    await sendEmailRaw(apiKey, email, 'Verify your Homes Hub account', html);
  } catch (err) {
    console.warn('Failed to send verification email', err);
  }

  return NextResponse.json({ id: user.id, email: user.email });
}
