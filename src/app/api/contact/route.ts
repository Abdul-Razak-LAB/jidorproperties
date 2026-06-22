import { NextRequest, NextResponse } from 'next/server';
import { sendEmailRaw } from '@/lib/email';
import { hasDatabase, prisma } from '@/lib/prisma';

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  try {
    const contactRecipient = process.env.CONTACT_RECIPIENT_EMAIL || 'Jidorproperties@gmail.com';
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br/>');

    const subject = `New contact form message from ${safeName}`;
    const html = `
      <h2>New Contact Request</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `;

    let queueId: string | undefined;
    if (hasDatabase && prisma) {
      const queued = await prisma.emailQueue.create({
        data: {
          to: contactRecipient,
          templateId: 'contact_form',
          status: 'pending',
          variables: {
            name: String(name),
            email: String(email),
            message: String(message),
          },
        },
      });
      queueId = queued.id;
    }

    try {
      const sent = await sendEmailRaw(apiKey, contactRecipient, subject, html);
      if (queueId && prisma) {
        await prisma.emailQueue.update({
          where: { id: queueId },
          data: {
            status: 'sent',
            resendMessageId: typeof sent?.id === 'string' ? sent.id : null,
          },
        });
      }
    } catch (error) {
      if (queueId && prisma) {
        await prisma.emailQueue.update({
          where: { id: queueId },
          data: { status: 'failed' },
        });
      }
      throw error;
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.warn('Failed to process contact form', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
