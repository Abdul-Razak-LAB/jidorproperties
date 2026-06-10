import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const url = new URL(req.url);
  const token = url.searchParams.get('token') || undefined;
  const email = url.searchParams.get('email') || undefined;

  if (!token || !email) return NextResponse.json({ error: 'token and email required' }, { status: 400 });

  const tokenRow = await prisma.verificationToken.findUnique({ where: { token } });
  if (!tokenRow || tokenRow.type !== 'verify') return NextResponse.json({ error: 'invalid token' }, { status: 400 });
  if (new Date(tokenRow.expiresAt) < new Date()) return NextResponse.json({ error: 'expired' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: tokenRow.userId } });
  if (!user || user.email !== email) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { verifiedAt: new Date() } });
  await prisma.verificationToken.deleteMany({ where: { userId: user.id, type: 'verify' } });

  return NextResponse.json({ status: 'verified' });
}
