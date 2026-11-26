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
    const { name, email, message, phone, propertyId, propertyTitle } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'name, email, and message are required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY?.trim() || '';
    const hasResendApiKey = apiKey.length > 0 && !/^(replace|your|<)/i.test(apiKey);
    if (!hasResendApiKey && (!hasDatabase || !prisma)) {
      return NextResponse.json({ error: 'Request service is not configured' }, { status: 503 });
    }

    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safePhone = phone ? escapeHtml(String(phone)) : '';
    const safePropertyTitle = propertyTitle ? escapeHtml(String(propertyTitle)) : '';
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, '<br/>');

    const subject = `New contact form message from ${safeName}${safePropertyTitle ? ` about ${safePropertyTitle}` : ''}`;
    const html = `
      <h2>New Contact Request</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
      ${safePropertyTitle ? `<p><strong>Property:</strong> ${safePropertyTitle}</p>` : ''}
      ${propertyId ? `<p><strong>Property ID:</strong> ${escapeHtml(String(propertyId))}</p>` : ''}
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
            phone: String(phone || ''),
            propertyId: String(propertyId || ''),
            propertyTitle: String(propertyTitle || ''),
            message: String(message),
          },
        },
      });
      queueId = queued.id;
    }

    let emailStatus: 'pending' | 'sent' | 'failed' = 'pending';
    if (hasResendApiKey) {
      try {
        const sent = await sendEmailRaw(apiKey, contactRecipient, subject, html);
        emailStatus = 'sent';
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
        emailStatus = 'failed';
        if (queueId && prisma) {
          await prisma.emailQueue.update({
            where: { id: queueId },
            data: { status: 'failed' },
          });
        }
        console.warn('Contact request was saved but notification email failed', error);
      }
    }

    return NextResponse.json(
      { status: 'received', emailStatus },
      { status: emailStatus === 'sent' || !queueId ? 200 : 202 },
    );
  } catch (error) {
    console.warn('Failed to process contact form', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
