import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { hasDatabase, prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });

  // Issue session / JWT — placeholder
  return NextResponse.json({ id: user.id, email: user.email });
}
