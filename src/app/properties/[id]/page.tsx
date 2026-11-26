import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma, hasDatabase } from '@/lib/prisma';
import { sampleProperties } from '@/lib/sampleProperties';
import PropertyInquiryActions from '@/components/PropertyInquiryActions';
import PropertyShortlistButton from '@/components/PropertyShortlistButton';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getLocale } from '@/lib/getLocale';
import { translate } from '@/lib/i18n';

type PropertyImage = {
  url: string;
  caption?: string;
  id?: string;
  propertyId?: string;
  sortOrder?: number;
};

type PropertyView = {
  id: string;
  title: string;
  description?: string | null;
  location?: { text?: string } | null;
  address?: { text?: string } | null;
  price?: number | string | null;
  propertyType?: string | null;
  status?: string | null;
  currency?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | null;
  metadata?: { areaNotes?: string | null; youtubeVideoId?: string | null } | null;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
  images?: PropertyImage[];
};

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getLocale();
  const t = (text: string) => translate(locale, text);
  const resolvedParams = await params;
  let property: PropertyView | null = null;

  if (hasDatabase && prisma) {
    try {
      const dbProperty = await prisma.property.findUnique({
        where: { id: resolvedParams.id },
        include: { images: true },
      });

      if (dbProperty) {
        property = dbProperty as unknown as PropertyView;
      }
    } catch (error) {
      console.warn('Property lookup failed. Falling back to sample data.', error);
    }
  }

  if (!property && resolvedParams.id in sampleProperties) {
    property = sampleProperties[resolvedParams.id as keyof typeof sampleProperties];
  }

  if (!property) {
    notFound();
  }

  const images = property.images || [];

  const locationText = property.location?.text ?? 'Location not available';
  const addressText = property.address?.text ?? 'Address not available';
  const priceNumber = property.price ? Number(String(property.price).replace(/[^0-9.-]/g, '')) : 0;
  const priceText = priceNumber > 0
    ? new Intl.NumberFormat(locale, { style: 'currency', currency: property.currency || 'GHS', maximumFractionDigits: 0 }).format(priceNumber)
    : t('Price on request');
  const propertyType = property.propertyType || 'Property';
  const status = property.status || 'Available';
  const details = [
    { label: translate(locale, 'Type'), value: propertyType },
    { label: translate(locale, 'Status'), value: status },
    ...(property.bedrooms ? [{ label: translate(locale, 'Bedrooms'), value: String(property.bedrooms) }] : []),
    ...(property.bathrooms ? [{ label: translate(locale, 'Bathrooms'), value: String(property.bathrooms) }] : []),
    ...(property.areaSqm ? [{ label: translate(locale, 'Floor area'), value: `${property.areaSqm} m²` }] : []),
    { label: translate(locale, 'Location'), value: locationText },
    { label: translate(locale, 'Address'), value: addressText },
    { label: translate(locale, 'Price'), value: priceText },
  ];
  const areaNotes = property.metadata?.areaNotes?.split('\n').map((note) => note.trim()).filter(Boolean) || [];
  const publishedDate = property.publishedAt ? new Date(property.publishedAt) : null;
  const shortlistProperty = {
    id: property.id,
    title: property.title,
    status,
    propertyType,
    location: locationText,
    price: priceNumber,
    currency: property.currency || 'GHS',
    imageUrl: images[0]?.url || '',
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
  };
  const mapsQuery = encodeURIComponent([addressText, locationText].filter((value) => !value.includes('not available')).join(', '));

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-700">{t('Property Details')}</p>
            <h1 className="mt-3 break-words text-3xl font-semibold text-slate-900 sm:text-4xl lg:text-5xl">{property.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-600">{t('A detailed breakdown of the listing organized into overview, gallery, and property details.')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
              {t('Back to homepage')}
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:rounded-[2rem] sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-700">{t('Overview')}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">{t('Property summary')}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <PropertyShortlistButton property={shortlistProperty} locale={locale} />
                  <span className="rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-800">{status}</span>
                </div>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-600">{t('Price')}</p>
                  <p className="text-3xl font-semibold text-slate-900">{priceText}</p>
                </div>
                <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-600">{t('Location')}</p>
                  <p className="text-lg font-semibold text-slate-900">{locationText}</p>
                  <p className="text-sm text-slate-600">{addressText}</p>
                  {mapsQuery ? (
                    <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noreferrer" className="inline-flex text-sm font-semibold text-amber-700 hover:text-amber-800">
                      {t('Explore this area on Maps')}
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="mt-6 text-slate-700">
                <h3 className="text-lg font-semibold text-slate-900">{t('About this listing')}</h3>
                <p className="mt-3 leading-8">{property.description || t('No description was provided for this property.')}</p>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">{t('Property passport')}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{t('Listing record')}</h3>
                  </div>
                  <span className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700">Ref. {property.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p className="text-slate-600">{t('Listing status')} <span className="ml-2 font-semibold text-slate-900">{status}</span></p>
                  <p className="text-slate-600">{t('Published')} <span className="ml-2 font-semibold text-slate-900">{publishedDate && !Number.isNaN(publishedDate.getTime()) ? publishedDate.toLocaleDateString(locale, { dateStyle: 'medium' }) : t('Date not recorded')}</span></p>
                </div>
                <p className="mt-4 text-xs leading-5 text-slate-600">{t('Listing information is supplied by Jidor Properties. Confirm current availability and terms with the team before making a decision.')}</p>
              </div>
              {areaNotes.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{t('Around the neighborhood')}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    {areaNotes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}
                  </ul>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:rounded-[2rem] sm:p-6 lg:p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-700">{t('Gallery')}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{t('Photo showcase')}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {images.length > 0 ? images.map((image, index) => (
                  <figure key={image.id ?? `${image.url}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
                    <Image fill sizes="(max-width: 640px) 100vw, 50vw" priority={index === 0} unoptimized className="object-cover" src={image.url} alt={image.caption || `${property.title}, photo ${index + 1}`} />
                    {image.caption ? <figcaption className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">{image.caption}</figcaption> : null}
                  </figure>
                )) : (
                  <div className="flex min-h-48 items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white text-sm text-slate-600 sm:col-span-2">{t('Photos for this property are not available yet.')}</div>
                )}
              </div>
              {property.metadata?.youtubeVideoId ? (
                <div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
                  <iframe
                    className="aspect-video w-full"
                    src={`https://www.youtube-nocookie.com/embed/${property.metadata.youtubeVideoId}`}
                    title={`${property.title} walkthrough`}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:rounded-[2rem] sm:p-6 lg:p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-700">{t('Property details')}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{t('Features')}</h2>
              <div className="mt-6 space-y-4">
                {details.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-600">{item.label}</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70 sm:rounded-[2rem] sm:p-6 lg:p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-700">{t('Action')}</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">{t('Next steps')}</h2>
              <div className="mt-6 space-y-4 text-slate-700">
                <p>{t('Use the buttons below to share this property, request more details, or contact the listing owner.')}</p>
                <PropertyInquiryActions propertyId={property.id} propertyTitle={property.title} locale={locale} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}