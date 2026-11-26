'use client';

import Link from 'next/link';
import Image from 'next/image';
import { samplePropertyList } from '@/lib/sampleProperties';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';

type PropertyImage = {
  id?: string;
  url: string;
};

type PropertyTypeGalleryImage = {
  id: string;
  propertyType: string;
  url: string;
  caption?: string | null;
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
const propertyTypes = ['Apartment', 'House', 'Warehouse', 'Construction', 'Uncompleted properties'];
const currencyOptions = ['USD', 'GHS'];
const SALES_PHONE = '+233209225268';
const SALES_EMAIL = 'sales@jidorproperties.com';

function isDesktopEnvironment() {
  if (typeof navigator === 'undefined') return false;
  return /Windows|Macintosh|Linux/i.test(navigator.userAgent);
}

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
  const [propertyTypeImages, setPropertyTypeImages] = useState<PropertyTypeGalleryImage[]>([]);
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
  const [areaNotes, setAreaNotes] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 2600);
  };

  const handleCallClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isDesktopEnvironment()) return;

    event.preventDefault();
    try {
      await navigator.clipboard.writeText(SALES_PHONE);
      showToast(`Call ${SALES_PHONE}. Number copied to clipboard.`);
    } catch {
      showToast(`Call ${SALES_PHONE}`);
    }
  };

  const handleEmailClick = (event: MouseEvent<HTMLAnchorElement>, subject: string, body: string) => {
    if (!isDesktopEnvironment()) return;

    event.preventDefault();
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SALES_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailComposeUrl, '_blank', 'noopener,noreferrer');
    showToast('Opening email compose.');
  };

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

  useEffect(() => {
    fetch('/api/property-types/images')
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) setPropertyTypeImages(data as PropertyTypeGalleryImage[]);
      })
      .catch((error) => console.error('Failed to load property type images', error));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const addMode = (url.searchParams.get('add') || '').toLowerCase();
    if (addMode === '1' || addMode === 'true' || addMode === 'yes') {
      setFormMessage(null);
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
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
    setAreaNotes('');
    setYoutubeUrl('');
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

  const handlePropertyTypeImageUpload = async (propertyType: string, event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const payload = new FormData();
    payload.append('propertyType', propertyType);
    payload.append('image', file);

    try {
      const response = await fetch('/api/property-types/images', { method: 'POST', body: payload });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        showToast(body?.error || 'Unable to upload property type image.');
        return;
      }

      setPropertyTypeImages((current) => [...current, body as PropertyTypeGalleryImage]);
      showToast(`${propertyType} image added.`);
    } catch {
      showToast('Unable to upload property type image. Please try again.');
    } finally {
      input.value = '';
    }
  };

  const handlePropertyTypeImageDelete = async (image: PropertyTypeGalleryImage) => {
    try {
      const response = await fetch('/api/property-types/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: image.id }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        showToast(body?.error || 'Unable to remove property type image.');
        return;
      }

      setPropertyTypeImages((current) => current.filter((item) => item.id !== image.id));
      showToast(`${image.propertyType} image removed.`);
    } catch {
      showToast('Unable to remove property type image. Please try again.');
    }
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

  const propertyTypeGallery = useMemo(() => {
    const propertySource = properties.length > 0 ? properties : samplePropertyList.map((item) => ({
      id: item.id,
      title: item.title,
      propertyType: item.propertyType,
      status: item.status,
      price: item.price,
      currency: 'GHS',
      location: item.location,
      images: item.images.map((image) => ({ id: image.url, url: image.url })),
    })) as Property[];

    const uniqueTypes = new Map<string, Property>();
    propertySource.forEach((property) => {
      const type = property.propertyType?.trim() || 'Other';
      if (!uniqueTypes.has(type)) {
        uniqueTypes.set(type, property);
      }
    });
    propertyTypes.forEach((type) => {
      if (!uniqueTypes.has(type)) {
        uniqueTypes.set(type, {
          id: `type-${type}`,
          title: type,
          propertyType: type,
          status: 'draft',
          images: [],
        });
      }
    });
    return Array.from(uniqueTypes.values());
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
      payload.append('areaNotes', areaNotes.trim());
      payload.append('youtubeUrl', youtubeUrl.trim());
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
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white p-4 shadow-lg shadow-slate-200/70 sm:rounded-3xl sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              
              <p className="mt-2 text-sm text-slate-600">Create, manage, and monitor listings from one clean dashboard.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                Back to website
              </Link>
              <Link href="/admin" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                Dashboard report
              </Link>
              
              <button
                type="button"
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded-full bg-[#0b2d67] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#0d3770]"
              >
                + Add New Property
              </button>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{properties.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/60">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Published</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{properties.filter((item) => (item.status || '').toLowerCase() === 'published').length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-200/60">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Added Last 7 Days</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{recentCount}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 sm:rounded-3xl sm:p-6">
          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-amber-600">Property type gallery</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-900">Browse available property types</h2>
              <p className="mt-2 text-sm text-slate-600">Upload and manage the images shown for each property type on the website.</p>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {propertyTypeGallery.map((property) => {
                const typeName = property.propertyType?.trim() || 'Other';
                const typeImages = propertyTypeImages.filter((image) => image.propertyType.toLowerCase() === typeName.toLowerCase());
                const coverUrl = typeImages[0]?.url || property.images?.[0]?.url;

                return (
                  <article key={typeName} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative aspect-[4/3] w-full bg-slate-100">
                      {coverUrl ? (
                        <Image src={coverUrl} alt={`${typeName} property type`} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" unoptimized className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">No image available</div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-4 py-3 text-white">
                        <p className="text-sm font-semibold uppercase tracking-[0.18em]">{typeName}</p>
                        {!typeImages.length ? <p className="mt-1 text-xs text-slate-200 line-clamp-1">Using listing cover</p> : null}
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-800">{typeImages.length} custom {typeImages.length === 1 ? 'image' : 'images'}</p>
                        <label className="cursor-pointer rounded-md bg-[#0b2d67] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#123b85]">
                          Add image
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            className="sr-only"
                            onChange={(event) => handlePropertyTypeImageUpload(typeName, event)}
                          />
                        </label>
                      </div>
                      {typeImages.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {typeImages.map((image) => (
                            <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                              <Image src={image.url} alt={image.caption || `${typeName} property type image`} fill sizes="100px" unoptimized className="object-cover" />
                              <button
                                type="button"
                                onClick={() => handlePropertyTypeImageDelete(image)}
                                aria-label={`Remove ${image.caption || typeName + ' image'}`}
                                className="absolute right-1 top-1 rounded bg-white/95 px-2 py-1 text-[10px] font-semibold text-rose-700 shadow hover:bg-rose-50"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs leading-5 text-slate-500">Add category photos to replace the listing-cover fallback on the website.</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-visible sm:overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
          <div className="overflow-x-visible sm:overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
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
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">Loading properties...</td>
                  </tr>
                ) : properties.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">No properties found. Click Add Property to create your first listing.</td>
                  </tr>
                ) : (
                  properties.map((property) => {
                    const statusText = toTitleCase(property.status);
                    const locationText = property.location?.text || 'Unknown location';
                    const priceText = formatPrice(property.price, property.currency);
                    const inquiryMessage = encodeURIComponent(
                      `Hello, I am interested in ${property.title} at ${locationText}. Price: ${priceText}.`
                    );
                    const emailSubject = `Inquiry: ${property.title}`;
                    const emailBody = `Hello, I am interested in ${property.title} at ${locationText}. Price: ${priceText}.`;
                    const whatsappUrl = `https://wa.me/${SALES_PHONE.replace(/\+/g, '')}?text=${inquiryMessage}`;
                    const callUrl = `tel:${SALES_PHONE}`;
                    const emailUrl = `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                    const badgeClass =
                      (property.status || '').toLowerCase() === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : (property.status || '').toLowerCase() === 'sold'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <tr key={property.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                              {property.images?.[0]?.url ? (
                                <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{property.title}</p>
                              <p className="text-xs text-slate-500">ID: {property.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{property.propertyType || 'N/A'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}>{statusText}</span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{locationText}</td>
                        <td className="px-5 py-4 font-medium text-slate-800">{priceText}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/properties/${property.id}`} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
                              View
                            </Link>
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              WhatsApp
                            </a>
                            <a
                              href={callUrl}
                              onClick={handleCallClick}
                              className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                            >
                              Call
                            </a>
                            <a
                              href={emailUrl}
                              onClick={(event) => handleEmailClick(event, emailSubject, emailBody)}
                              className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                            >
                              Email
                            </a>
                          </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-visible sm:overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-300/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-amber-600">Add New Property</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create Property Listing</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Property Images</label>
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
                  className="w-full rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:border-amber-400 hover:bg-amber-100"
                >
                  Upload or take photo
                </button>
                <p className="text-xs text-slate-500">First image will be used as listing cover.</p>
                {selectedImages.length > 0 ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedImages.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <p className="truncate text-sm text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-500">{Math.round(file.size / 1024)} KB</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="mt-2 text-xs font-semibold text-rose-600 transition hover:text-rose-700"
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
                  <label className="text-sm font-semibold text-slate-800">Property Name</label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="e.g. East Legon Family Villa"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                  >
                    {propertyTypes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Status</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                  >
                    {statusOptions.map((item) => (
                      <option key={item} value={item}>{toTitleCase(item)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Price</label>
                  <input
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="e.g. 2500000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Currency</label>
                  <select
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                  >
                    {currencyOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Bedrooms</label>
                  <input
                    value={bedrooms}
                    onChange={(event) => setBedrooms(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="e.g. 4"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Bathrooms</label>
                  <input
                    value={bathrooms}
                    onChange={(event) => setBathrooms(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="e.g. 3"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">Area (sqm)</label>
                  <input
                    value={areaSqm}
                    onChange={(event) => setAreaSqm(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="e.g. 180"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">Location</label>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="e.g. Greater Accra"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">Address</label>
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="e.g. House 21, Airport Residential"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">Neighborhood notes</label>
                  <textarea
                    value={areaNotes}
                    onChange={(event) => setAreaNotes(event.target.value)}
                    rows={3}
                    maxLength={2000}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="Add verified nearby landmarks, transport links, or area details..."
                  />
                  <p className="text-xs text-slate-500">Only include details confirmed by your team.</p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">YouTube walkthrough URL</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="https://youtu.be/..."
                  />
                  <p className="text-xs text-slate-500">Optional. Use an HTTPS YouTube video link.</p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-slate-800">Description</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0b2d67] focus:ring-2 focus:ring-[#0b2d67]/15"
                    placeholder="Describe this listing..."
                  />
                </div>
              </div>

              {formMessage ? (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{formMessage}</p>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#0b2d67] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#123b85] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Creating...' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-2xl shadow-slate-300/60 backdrop-blur-md">
          {toastMessage}
        </div>
      ) : null}
    </main>
  );
}
