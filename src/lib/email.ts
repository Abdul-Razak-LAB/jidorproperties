const RESEND_API_URL = 'https://api.resend.com/emails';

export async function sendEmailRaw(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: 'no-reply@homeshub.com',
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend send failed: ${res.status} ${text}`);
  }

  return res.json();
}
