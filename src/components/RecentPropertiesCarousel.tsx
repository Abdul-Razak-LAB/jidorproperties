'use client';

import Image from 'next/image';
import Link from 'next/link';
import PropertyShortlistButton from '@/components/PropertyShortlistButton';
import { translate, type Locale } from '@/lib/i18n';

type PropertyItem = {
  id: string;
  title: string;
  status: string;
  propertyType: string;
  location: string;
  price: number;
  currency?: string;
  imageUrl: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | null;
};

type RecentPropertiesCarouselProps = {
  properties: PropertyItem[];
  locale: Locale;
};

const SALES_PHONE = '+233209225268';
const SALES_EMAIL = 'sales@jidorproperties.com';

function formatMoney(value: number, currency = 'GHS', locale: Locale = 'en') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClasses(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('rent')) return 'bg-indigo-950/90 text-indigo-100 border-indigo-300/30';
  if (normalized.includes('sold')) return 'bg-emerald-950/90 text-emerald-100 border-emerald-300/30';
  return 'bg-slate-950/90 text-slate-100 border-slate-300/30';
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 motion-safe:animate-bounce" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s7-5.6 7-12a7 7 0 1 0-14 0c0 6.4 7 12 7 12z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 motion-safe:animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1.8.3 1.6.6 2.4a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.4-1.2a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.4.6A2 2 0 0 1 22 16.9z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 motion-safe:animate-pulse" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 8l9 6 9-6" />
    </svg>
  );
}

export default function RecentPropertiesCarousel({ properties, locale }: RecentPropertiesCarouselProps) {
  const t = (text: string) => translate(locale, text);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#0b2d67]">{t('Recent Properties')}</h2>
        <Link href="/admin/properties" className="text-sm font-semibold text-amber-600 hover:text-amber-700">{t('View All')}</Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {properties.map((property) => (
          <article key={property.id} className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={property.imageUrl}
                alt={property.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, (max-width: 1536px) 33vw, 25vw"
                className="object-cover"
              />
              <span className={`absolute left-2 top-2 rounded-full border px-2 py-1 text-xs font-semibold ${statusClasses(property.status)}`}>
                {property.status}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="line-clamp-1 text-sm font-semibold text-slate-900">{property.title}</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{property.location}</p>
              <p className="mt-1 line-clamp-1 text-xs text-slate-500">{property.propertyType}</p>
              <p className="mt-3 text-xl font-semibold text-amber-600">{formatMoney(property.price, property.currency, locale)}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Link href={`/properties/${property.id}`} className="text-xs font-semibold text-[#0b2d67] hover:underline">{t('View details')}</Link>
                <PropertyShortlistButton property={{ ...property, currency: property.currency || 'GHS' }} locale={locale} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-md bg-amber-500 px-2 py-1.5 text-white transition hover:bg-amber-400"
                >
                  <LocationIcon />
                  <span>{t('Location')}</span>
                </a>
                <a
                  href={`tel:${SALES_PHONE}`}
                  className="inline-flex items-center justify-center gap-1 rounded-md bg-amber-500 px-2 py-1.5 text-white transition hover:bg-amber-400"
                >
                  <PhoneIcon />
                  <span>{t('Call')}</span>
                </a>
                <a
                  href={`mailto:${SALES_EMAIL}?subject=${encodeURIComponent(`Property inquiry: ${property.title}`)}`}
                  className="inline-flex items-center justify-center gap-1 rounded-md bg-amber-500 px-2 py-1.5 text-white transition hover:bg-amber-400"
                >
                  <MailIcon />
                  <span>{t('Email')}</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}
