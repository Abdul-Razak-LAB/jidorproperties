'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

type PropertyImage = {
  id?: string;
  url: string;
};

type Property = {
  id: string;
  title: string;
  propertyType?: string | null;
  status?: string | null;
  price?: string | number | null;
  currency?: string | null;
  location?: { text?: string } | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | null;
  createdAt?: string;
  images?: PropertyImage[];
};

const statusOptions = ['published', 'draft', 'sold', 'rented'];
const propertyTypes = ['House', 'Apartment', 'Townhouse', 'Land', 'Warehouse', 'Commercial', 'Office'];
const currencyOptions = ['USD', 'GHS'];

function formatPrice(value: Property['price'], currency?: string | null) {
  if (value === null || value === undefined || value === '') return 'Price on request';
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  if (!Number.isFinite(parsed)) return 'Price on request';

  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(parsed);
}

function toTitleCase(value?: string | null) {
  if (!value) return 'N/A';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState(propertyTypes[0]);
  const [status, setStatus] = useState(statusOptions[0]);
  const [currency, setCurrency] = useState(currencyOptions[0]);
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSqm, setAreaSqm] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) {
          setProperties(data as Property[]);
        }
      } catch (error) {
        console.error('Failed to load properties', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPropertyType(propertyTypes[0]);
    setStatus(statusOptions[0]);
    setCurrency(currencyOptions[0]);
    setPrice('');
    setLocation('');
    setAddress('');
    setBedrooms('');
    setBathrooms('');
    setAreaSqm('');
    setSelectedImages([]);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setSelectedImages((current) => [...current, ...files]);
    event.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const closeModal = () => {
    setIsOpen(false);
    setFormMessage(null);
  };

  const openModal = () => {
    setFormMessage(null);
    setIsOpen(true);
  };

  const recentCount = useMemo(() => {
    const now = Date.now();
    const sevenDays = 1000 * 60 * 60 * 24 * 7;

    return properties.filter((property) => {
      if (!property.createdAt) return false;
      const created = new Date(property.createdAt).getTime();
      return Number.isFinite(created) && now - created < sevenDays;
    }).length;
  }, [properties]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null);

    if (!title.trim()) {
      setFormMessage('Property title is required.');
      return;
    }

    if (selectedImages.length === 0) {
      setFormMessage('Add at least one property image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append('title', title.trim());
      payload.append('description', description.trim());
      payload.append('propertyType', propertyType);
      payload.append('status', status);
      payload.append('currency', currency);
      payload.append('price', price);
      payload.append('location', location.trim());
      payload.append('address', address.trim());
      payload.append('bedrooms', bedrooms);
      payload.append('bathrooms', bathrooms);
      payload.append('areaSqm', areaSqm);
      selectedImages.forEach((file) => payload.append('images', file));

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: payload,
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFormMessage(body?.error || 'Unable to create property.');
        return;
      }

      setProperties((current) => [body as Property, ...current]);
      setFormMessage('Property added successfully.');
      resetForm();
      setIsOpen(false);
    } catch {
      setFormMessage('Unable to create property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Inventory Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Property Catalog</h1>
              <p className="mt-2 text-sm text-slate-400">Create and manage listings from one place, similar to a product dashboard.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white">
                Back to website
              </Link>
              <Link href="/admin/leads" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white">
                View leads
              </Link>
              <button
                type="button"
                onClick={openModal}
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                + Add Property
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Listings</p>
              <p className="mt-2 text-2xl font-semibold text-white">{properties.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Published</p>
              <p className="mt-2 text-2xl font-semibold text-white">{properties.filter((item) => (item.status || '').toLowerCase() === 'published').length}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Added Last 7 Days</p>
              <p className="mt-2 text-2xl font-semibold text-white">{recentCount}</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/20">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Property</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">Loading properties...</td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">No properties found. Click Add Property to create your first listing.</td>
                  </tr>
                ) : (
                  properties.map((property) => {
                    const statusText = toTitleCase(property.status);
                    const badgeClass =
                      (property.status || '').toLowerCase() === 'published'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : (property.status || '').toLowerCase() === 'sold'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

                    return (
                      <tr key={property.id} className="border-b border-slate-800/80 hover:bg-slate-950/50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
                              {property.images?.[0]?.url ? (
                                <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{property.title}</p>
                              <p className="text-xs text-slate-500">ID: {property.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300">{property.propertyType || 'N/A'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>{statusText}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-300">{property.location?.text || 'Unknown'}</td>
                        <td className="px-5 py-4 text-slate-200">{formatPrice(property.price, property.currency)}</td>
                        <td className="px-5 py-4">
                          <Link href={`/properties/${property.id}`} className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white">
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Add New Property</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Create Listing</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Property Images</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFilesChange}
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400 hover:bg-emerald-500/20"
                >
                  Upload or take photo
                </button>
                <p className="text-xs text-slate-500">First image will be used as listing cover.</p>
                {selectedImages.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedImages.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2">
                        <p className="truncate text-sm text-slate-200">{file.name}</p>
                        <p className="text-xs text-slate-500">{Math.round(file.size / 1024)} KB</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="mt-2 text-xs font-semibold text-rose-300 transition hover:text-rose-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-white">Property Name</label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. East Legon Family Villa"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {propertyTypes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Status</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {statusOptions.map((item) => (
                      <option key={item} value={item}>{toTitleCase(item)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Price</label>
                  <input
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. 2500000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Currency</label>
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {currencyOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Bedrooms</label>
                  <input
                    value={bedrooms}
                    onChange={(event) => setBedrooms(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. 4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Bathrooms</label>
                  <input
                    value={bathrooms}
                    onChange={(event) => setBathrooms(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. 3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Area (sqm)</label>
                  <input
                    value={areaSqm}
                    onChange={(event) => setAreaSqm(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. 180"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-white">Location</label>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. Greater Accra"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-white">Address</label>
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. House 21, Airport Residential"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-white">Description</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Describe this listing..."
                  />
                </div>
              </div>

              {formMessage ? (
                <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">{formMessage}</p>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Creating...' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
