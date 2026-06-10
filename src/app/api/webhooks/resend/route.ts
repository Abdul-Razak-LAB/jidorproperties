import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifySignature(secret: string, payload: string, signature: string) {
  try {
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    // constant time compare
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(signature));
  } catch (err) {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('resend-signature') || req.headers.get('x-resend-signature') || '';
  const secret = process.env.RESEND_WEBHOOK_SECRET || '';

  if (secret) {
    if (!signature || !verifySignature(secret, body, signature)) {
      console.warn('Invalid webhook signature');
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }
  } else {
    console.warn('No RESEND_WEBHOOK_SECRET configured; accepting webhook without verification');
  }

  try {
    const payload = JSON.parse(body);
    // update email_queue or take action based on event type
    console.log('Resend webhook event:', payload);
  } catch (err) {
    console.warn('Could not parse webhook payload');
  }

  return NextResponse.json({ status: 'received' });
}
