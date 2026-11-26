'use client';

import { useState, type FormEvent } from 'react';
import { translate, type Locale } from '@/lib/i18n';

type InquiryType = 'information' | 'viewing';

type PropertyInquiryActionsProps = {
  propertyId: string;
  propertyTitle: string;
  locale: Locale;
};

function getErrorMessage(payload: unknown, locale: Locale) {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    typeof payload.error === 'string'
  ) {
    return translate(locale, payload.error);
  }
  return translate(locale, 'We could not submit your request. Please try again.');
}

export default function PropertyInquiryActions({
  propertyId,
  propertyTitle,
  locale,
}: PropertyInquiryActionsProps) {
  const t = (text: string) => translate(locale, text);
  const [inquiryType, setInquiryType] = useState<InquiryType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inquiryType) return;

    const form = event.currentTarget;
    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData(form);
    const commonFields = {
      name: String(formData.get('name') || '').trim(),
      email: String(formData.get('email') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      propertyId,
      propertyTitle,
    };

    const isViewing = inquiryType === 'viewing';
    const body = isViewing
      ? {
          ...commonFields,
          preferredDate: formData.get('preferredDate'),
          preferredTime: formData.get('preferredTime'),
          notes: String(formData.get('notes') || '').trim(),
        }
      : {
          ...commonFields,
          message: String(formData.get('message') || '').trim(),
        };

    try {
      const response = await fetch(isViewing ? '/api/consultation' : '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setFeedback({ type: 'error', message: getErrorMessage(payload, locale) });
        return;
      }

      const emailPending = payload &&
        typeof payload === 'object' &&
        'emailStatus' in payload &&
        payload.emailStatus !== 'sent';
      setFeedback({
        type: 'success',
        message: emailPending
          ? t('Your request was saved, but email notification is unavailable right now. Please contact Jidor directly if you need an urgent response.')
          : isViewing
            ? t('Your viewing request has been sent. Our team will contact you to confirm a time.')
            : t('Your request was sent. Our team will be in touch soon.'),
      });
      form.reset();
    } catch {
      setFeedback({
        type: 'error',
        message: t('We could not reach the server. Please check your connection and try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function chooseInquiry(type: InquiryType) {
    setInquiryType(type);
    setFeedback(null);
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => chooseInquiry('information')}
        aria-expanded={inquiryType === 'information'}
        className="rounded-3xl bg-[#0b2d67] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123b85]"
      >
        {t('Request info')}
      </button>
      <button
        type="button"
        onClick={() => chooseInquiry('viewing')}
        aria-expanded={inquiryType === 'viewing'}
        className="rounded-3xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        {t('Book a viewing')}
      </button>

      {inquiryType ? (
        <form
          key={inquiryType}
          onSubmit={handleSubmit}
          className="mt-2 space-y-4 rounded-3xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                {t(inquiryType === 'viewing' ? 'Request a property viewing' : 'Request property information')}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{propertyTitle}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setInquiryType(null);
                setFeedback(null);
              }}
              aria-label={t('Close inquiry form')}
              className="rounded-full px-2 text-slate-500 hover:text-slate-900"
            >
              ×
            </button>
          </div>

          <label className="block text-sm text-slate-700">
            {t('Name')}
            <input
              name="name"
              type="text"
              autoComplete="name"
              required
              maxLength={120}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </label>

          <label className="block text-sm text-slate-700">
            {t('Email')}
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </label>

          <label className="block text-sm text-slate-700">
            {t('Phone')} <span className="text-slate-500">({t('optional')})</span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </label>

          {inquiryType === 'viewing' ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm text-slate-700">
                  {t('Preferred date')}
                  <input
                    name="preferredDate"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  {t('Preferred time')}
                  <input
                    name="preferredTime"
                    type="time"
                    required
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </label>
              </div>
              <label className="block text-sm text-slate-700">
                {t('Notes')} <span className="text-slate-500">({t('optional')})</span>
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={2000}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
              <p className="text-xs text-slate-500">{t('This is a viewing request; our team will contact you to confirm availability.')}</p>
            </>
          ) : (
            <label className="block text-sm text-slate-700">
              {t('How can we help?')}
              <textarea
                name="message"
                rows={4}
                required
                maxLength={2000}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </label>
          )}

          {feedback ? (
            <p
              role="status"
              aria-live="polite"
              className={feedback.type === 'success' ? 'text-sm text-emerald-700' : 'text-sm text-rose-700'}
            >
              {feedback.message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t(isSubmitting ? 'Sending…' : inquiryType === 'viewing' ? 'Send viewing request' : 'Send information request')}
          </button>
        </form>
      ) : null}
    </div>
  );
}
