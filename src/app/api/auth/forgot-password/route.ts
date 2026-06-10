import { NextRequest, NextResponse } from 'next/server';
import { prisma, hasDatabase } from '@/lib/prisma';
import { sendEmailRaw } from '@/lib/email';

export async function POST(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ status: 'ok' });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ status: 'ok' });

  // Create a reset token and persist
  const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await prisma.verificationToken.create({ data: { token, type: 'reset', userId: user.id, expiresAt: expires } });

  try {
    const apiKey = process.env.RESEND_API_KEY || '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const link = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await sendEmailRaw(apiKey, email, 'Reset your Homes Hub password', `<p>Reset your password: <a href="${link}">Reset password</a></p>`);
  } catch (err) {
    console.warn('Failed to send reset email', err);
  }

  return NextResponse.json({ status: 'ok' });
}
