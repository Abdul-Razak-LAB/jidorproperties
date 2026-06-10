import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { hasDatabase, prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const { token, newPassword, email } = await req.json();
  if (!token || !newPassword || !email) return NextResponse.json({ error: 'token, email, and newPassword required' }, { status: 400 });

  // Verify token exists and not expired
  const tokenRow = await prisma.verificationToken.findUnique({ where: { token } });
  if (!tokenRow || tokenRow.type !== 'reset' || tokenRow.userId !== (await prisma.user.findUnique({ where: { email } }))?.id) {
    return NextResponse.json({ error: 'invalid or expired token' }, { status: 400 });
  }
  if (new Date(tokenRow.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'token expired' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: tokenRow.userId } });
  if (!user) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

  // delete token
  await prisma.verificationToken.deleteMany({ where: { userId: user.id, type: 'reset' } });

  return NextResponse.json({ status: 'ok' });
}
