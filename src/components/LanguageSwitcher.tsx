'use client';

import type { ChangeEvent } from 'react';
import { translate, type Locale } from '@/lib/i18n';

const languages: { code: Locale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
];

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  function changeLanguage(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.currentTarget.value;
    document.cookie = `jidor-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span>{translate(locale, 'Language')}</span>
      <select
        aria-label={translate(locale, 'Language')}
        value={locale}
        onChange={changeLanguage}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>{language.label}</option>
        ))}
      </select>
    </label>
  );
}
