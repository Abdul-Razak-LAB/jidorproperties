'use client';

import { useEffect, useState } from 'react';
import {
  readShortlist,
  SHORTLIST_EVENT,
  SHORTLIST_LIMIT,
  writeShortlist,
  type ShortlistProperty,
} from '@/lib/propertyShortlist';
import { translate, type Locale } from '@/lib/i18n';

export default function PropertyShortlistButton({ property, locale }: { property: ShortlistProperty; locale: Locale }) {
  const t = (text: string) => translate(locale, text);
  const [isSaved, setIsSaved] = useState(false);
  const [isFull, setIsFull] = useState(false);

  useEffect(() => {
    const sync = () => {
      const current = readShortlist();
      setIsSaved(current.some((item) => item.id === property.id));
      setIsFull(current.length >= SHORTLIST_LIMIT);
    };

    sync();
    window.addEventListener(SHORTLIST_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SHORTLIST_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [property.id]);

  function toggleSaved() {
    const current = readShortlist();
    if (current.some((item) => item.id === property.id)) {
      writeShortlist(current.filter((item) => item.id !== property.id));
      return;
    }
    if (current.length >= SHORTLIST_LIMIT) return;
    writeShortlist([...current, property]);
  }

  return (
    <button
      type="button"
      onClick={toggleSaved}
      disabled={!isSaved && isFull}
      aria-pressed={isSaved}
      aria-label={isSaved ? `${t('Remove')} ${property.title} ${t('from shortlist')}` : `${t('Add')} ${property.title} ${t('to shortlist')}`}
      title={!isSaved && isFull ? `${t('Shortlist limit is')} ${SHORTLIST_LIMIT} ${t('properties')}` : undefined}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        isSaved
          ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.5L6 21V4.75Z" />
      </svg>
      {t(isSaved ? 'Saved' : isFull ? 'Shortlist full' : 'Shortlist')}
    </button>
  );
}