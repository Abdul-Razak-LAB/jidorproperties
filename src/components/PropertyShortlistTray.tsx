'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readShortlist, SHORTLIST_EVENT, writeShortlist, type ShortlistProperty } from '@/lib/propertyShortlist';
import { translate, type Locale } from '@/lib/i18n';

export default function PropertyShortlistTray({ locale }: { locale: Locale }) {
  const t = (text: string) => translate(locale, text);
  const [properties, setProperties] = useState<ShortlistProperty[]>([]);

  useEffect(() => {
    const sync = () => setProperties(readShortlist());
    sync();
    window.addEventListener(SHORTLIST_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SHORTLIST_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (properties.length === 0) return null;

  return (
    <aside aria-label={t('Saved properties')} className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{t('Shortlist')} <span className="text-amber-700">{properties.length}/4</span></p>
        <p className="max-w-[55vw] truncate text-xs text-slate-600 sm:max-w-md">
          {properties.map((property) => property.title).join(' · ')}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => writeShortlist([])}
          className="rounded-md px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          {t('Clear')}
        </button>
        <Link href="/compare" className="rounded-md bg-[#0b2d67] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#123b85]">
          {t('Compare')}
        </Link>
      </div>
    </aside>
  );
}