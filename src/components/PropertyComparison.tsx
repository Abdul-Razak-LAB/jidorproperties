'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { readShortlist, SHORTLIST_EVENT, writeShortlist, type ShortlistProperty } from '@/lib/propertyShortlist';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { translate, type Locale } from '@/lib/i18n';

function formatPrice(property: ShortlistProperty, locale: Locale, t: (text: string) => string) {
  if (!property.price) return t('Price on request');
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: property.currency || 'GHS',
    maximumFractionDigits: 0,
  }).format(property.price);
}

export default function PropertyComparison({ locale }: { locale: Locale }) {
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

  if (properties.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-sm font-semibold text-[#0b2d67] hover:underline">{t('Back to properties')}</Link>
            <LanguageSwitcher locale={locale} />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">{t('Your shortlist is empty')}</h1>
          <p className="mt-2 text-slate-600">{t('Save properties as you browse, then compare their details here.')}</p>
          <Link href="/" className="mt-6 inline-flex rounded-md bg-[#0b2d67] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#123b85]">{t('Browse properties')}</Link>
        </div>
      </main>
    );
  }

  const rows: { label: string; value: (property: ShortlistProperty) => string }[] = [
    { label: t('Price'), value: (property: ShortlistProperty) => formatPrice(property, locale, t) },
    { label: t('Type'), value: (property: ShortlistProperty) => property.propertyType || t('Not provided') },
    { label: t('Listing status'), value: (property: ShortlistProperty) => property.status || t('Not provided') },
    { label: t('Location'), value: (property: ShortlistProperty) => property.location || t('Not provided') },
    { label: t('Bedrooms'), value: (property: ShortlistProperty) => property.bedrooms ? String(property.bedrooms) : t('Not provided') },
    { label: t('Bathrooms'), value: (property: ShortlistProperty) => property.bathrooms ? String(property.bathrooms) : t('Not provided') },
    { label: t('Floor area'), value: (property: ShortlistProperty) => property.areaSqm ? `${property.areaSqm} m²` : t('Not provided') },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/" className="text-sm font-semibold text-[#0b2d67] hover:underline">{t('Back to properties')}</Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{t('Property comparison')}</p>
            <h1 className="mt-2 text-3xl font-semibold">{t('Compare your shortlist')}</h1>
            <p className="mt-2 text-sm text-slate-600">{t('Saved on this device. Add up to four properties to compare.')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <button type="button" onClick={() => writeShortlist([])} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">{t('Clear shortlist')}</button>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm">
            <thead>
              <tr>
                <th scope="col" className="w-36 border-b border-slate-200 bg-slate-50 p-4 text-xs uppercase tracking-wide text-slate-500">{t('Property')}</th>
                {properties.map((property) => (
                  <th key={property.id} scope="col" className="border-b border-l border-slate-200 p-4 align-top">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
                      {property.imageUrl ? (
                        <Image src={property.imageUrl} alt={property.title} fill sizes="(max-width: 768px) 70vw, 25vw" priority unoptimized className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-500">{t('No photo available')}</div>
                      )}
                    </div>
                    <Link href={`/properties/${property.id}`} className="mt-3 block font-semibold text-slate-900 hover:text-[#0b2d67]">{property.title}</Link>
                    <button type="button" onClick={() => writeShortlist(properties.filter((item) => item.id !== property.id))} className="mt-2 text-xs font-semibold text-rose-700 hover:underline">{t('Remove')}</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
                  <th scope="row" className="bg-slate-50 p-4 text-xs font-semibold uppercase tracking-wide text-slate-600">{row.label}</th>
                  {properties.map((property) => (
                    <td key={property.id} className="border-l border-slate-100 p-4 text-slate-800">{row.value(property)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}