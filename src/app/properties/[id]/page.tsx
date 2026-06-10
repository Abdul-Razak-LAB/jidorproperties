import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma, hasDatabase } from '@/lib/prisma';
import { sampleProperties } from '@/lib/sampleProperties';

type Props = {
  params: {
    id: string;
  };
};

const sampleProperties = {
  'sample-1': {
    id: 'sample-1',
    title: '4 Bedroom House',
    description: 'A bright family home in the Greater Accra Region with modern finishes and easy access to local amenities.',
    propertyType: 'House',
    status: 'For Sale',
    price: 2500000,
    location: { text: 'Greater Accra' },
    address: { text: 'Plot 12, Community Road' },
    images: [
      { url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', caption: 'Front view' },
      { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', caption: 'Living room' },
    ],
  },
  'sample-2': {
    id: 'sample-2',
    title: '2 Bedroom Apartment',
    description: 'A modern apartment in the Ashanti Region, ideal for young professionals and investors.',
    propertyType: 'Apartment',
    status: 'For Rent',
    price: 680000,
    location: { text: 'Ashanti' },
    address: { text: 'Suite 8, City Tower' },
    images: [
      { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', caption: 'Apartment exterior' },
      { url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', caption: 'Bedroom' },
    ],
  },
  'sample-3': {
    id: 'sample-3',
    title: '3 Bedroom Townhouse',
    description: 'A spacious townhouse in the Volta Region with contemporary design and secure parking.',
    propertyType: 'Townhouse',
    status: 'New Project',
    price: 1200000,
    location: { text: 'Volta' },
    address: { text: 'Phase 2, Hillview Estate' },
    images: [
      { url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', caption: 'Townhouse entrance' },
      { url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', caption: 'Living area' },
    ],
  },
};

export default async function PropertyDetailPage({ params }: Props) {
  let property = null;

  if (hasDatabase && prisma) {
    property = await prisma.property.findUnique({
      where: { id: params.id },
      include: { images: true },
    });
  }

  if (!property && params.id in sampleProperties) {
    property = sampleProperties[params.id as keyof typeof sampleProperties] as any;
  }

  if (!property) {
    notFound();
  }

  const images = property.images && property.images.length
    ? property.images
    : [
        {
          id: 'placeholder',
          propertyId: property.id,
          url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          caption: 'Property image',
          sortOrder: 0,
        },
      ];

  const locationText = property.location?.text ?? 'Location not available';
  const addressText = property.address?.text ?? 'Address not available';
  const priceText = property.price ? `GHS ${property.price.toString()}` : 'Price on request';
  const propertyType = property.propertyType || 'Property';
  const status = property.status || 'Available';
  const details = [
    { label: 'Type', value: propertyType },
    { label: 'Status', value: status },
    { label: 'Location', value: locationText },
    { label: 'Address', value: addressText },
    { label: 'Price', value: priceText },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Property Details</p>
            <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">{property.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-400">A detailed breakdown of the listing organized into overview, gallery, and property details.</p>
          </div>
          <Link href="/" className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Back to homepage
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Overview</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Property summary</h2>
                </div>
                <span className="rounded-full bg-amber-500/10 px-4 py-2 text-sm text-amber-300">{status}</span>
              </div>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Price</p>
                  <p className="text-3xl font-semibold text-white">{priceText}</p>
                </div>
                <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/95 p-6">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Location</p>
                  <p className="text-lg font-semibold text-white">{locationText}</p>
                  <p className="text-sm text-slate-400">{addressText}</p>
                </div>
              </div>
              <div className="mt-6 text-slate-300">
                <h3 className="text-lg font-semibold text-white">About this listing</h3>
                <p className="mt-3 leading-8">{property.description || 'No description was provided for this property.'}</p>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Gallery</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Photo showcase</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {images.map((image) => (
                  <div key={image.url} className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/95">
                    <img className="h-60 w-full object-cover" src={image.url} alt={image.caption || property.title} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Property details</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Features</h2>
              <div className="mt-6 space-y-4">
                {details.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-950/95 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-base font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Action</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Next steps</h2>
              <div className="mt-6 space-y-4 text-slate-300">
                <p>Use the buttons below to share this property, request more details, or contact the listing owner.</p>
                <div className="grid gap-3">
                  <button className="rounded-3xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">Request info</button>
                  <button className="rounded-3xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400">Book a viewing</button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}