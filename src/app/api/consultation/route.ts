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

function isValidFutureDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return date >= today;
}

export async function POST(req: NextRequest) {
  try {
    const contactRecipient = process.env.CONTACT_RECIPIENT_EMAIL || 'Jidorproperties@gmail.com';
    const { name, email, preferredDate, preferredTime, notes, phone, propertyId, propertyTitle } = await req.json();
    const nameValue = String(name || '').trim();
    const emailValue = String(email || '').trim();
    const dateValue = String(preferredDate || '').trim();
    const timeValue = String(preferredTime || '').trim();
    const notesValue = String(notes || '').trim();
    const phoneValue = String(phone || '').trim();

    if (!nameValue || !emailValue || !dateValue || !timeValue) {
      return NextResponse.json(
        { error: 'name, email, preferredDate, and preferredTime are required' },
        { status: 400 },
      );
    }

    if (nameValue.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) || emailValue.length > 254) {
      return NextResponse.json({ error: 'Enter a valid name and email address.' }, { status: 400 });
    }
    if (!isValidFutureDate(dateValue) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(timeValue)) {
      return NextResponse.json({ error: 'Choose a valid date from today onward and a valid time.' }, { status: 400 });
    }
    if (phoneValue.length > 40 || notesValue.length > 2000) {
      return NextResponse.json({ error: 'Phone or notes exceed the allowed length.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY?.trim() || '';
    const hasResendApiKey = apiKey.length > 0 && !/^(replace|your|<)/i.test(apiKey);
    if (!hasResendApiKey && (!hasDatabase || !prisma)) {
      return NextResponse.json({ error: 'Request service is not configured' }, { status: 503 });
    }

    const safeName = escapeHtml(nameValue);
    const safeEmail = escapeHtml(emailValue);
    const safePhone = phoneValue ? escapeHtml(phoneValue) : '';
    const safePropertyTitle = propertyTitle ? escapeHtml(String(propertyTitle)) : '';
    const safePreferredDate = escapeHtml(dateValue);
    const safePreferredTime = escapeHtml(timeValue);
    const safeNotes = escapeHtml(notesValue).replace(/\n/g, '<br/>');

    const subject = `New viewing request from ${safeName}${safePropertyTitle ? ` for ${safePropertyTitle}` : ''}`;
    const html = `
      <h2>New Property Viewing Request</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
      ${safePropertyTitle ? `<p><strong>Property:</strong> ${safePropertyTitle}</p>` : ''}
      ${propertyId ? `<p><strong>Property ID:</strong> ${escapeHtml(String(propertyId))}</p>` : ''}
      <p><strong>Preferred date:</strong> ${safePreferredDate}</p>
      <p><strong>Preferred time:</strong> ${safePreferredTime}</p>
      <p><strong>Notes:</strong></p>
      <p>${safeNotes || 'No additional notes provided.'}</p>
    `;

    let queueId: string | undefined;
    if (hasDatabase && prisma) {
      const queued = await prisma.emailQueue.create({
        data: {
          to: contactRecipient,
          templateId: 'property_viewing',
          status: 'pending',
          variables: {
            name: nameValue,
            email: emailValue,
            phone: phoneValue,
            propertyId: String(propertyId || ''),
            propertyTitle: String(propertyTitle || ''),
            preferredDate: dateValue,
            preferredTime: timeValue,
            notes: notesValue,
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
        console.warn('Viewing request was saved but notification email failed', error);
      }
    }

    return NextResponse.json(
      { status: 'received', emailStatus },
      { status: emailStatus === 'sent' || !queueId ? 200 : 202 },
    );
  } catch (error) {
    console.warn('Failed to process consultation booking', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
