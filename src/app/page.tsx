'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

type Property = {
  id: string;
  title: string;
  location?: { text?: string };
  price?: string;
  propertyType?: string;
  status?: string;
  images?: { url: string }[];
};

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('House');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactText, setContactText] = useState('');
  const [contactFormMessage, setContactFormMessage] = useState<string | null>(null);
  const [isSubmittingContactForm, setIsSubmittingContactForm] = useState(false);
  const [consultationName, setConsultationName] = useState('');
  const [consultationEmail, setConsultationEmail] = useState('');
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('');
  const [consultationFormMessage, setConsultationFormMessage] = useState<string | null>(null);
  const [isSubmittingConsultationForm, setIsSubmittingConsultationForm] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) return;
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error('Failed to load properties', error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setSelectedImages((current) => [...current, ...files]);
    event.target.value = '';
  };

  const handleImagePickerOpen = () => {
    imageInputRef.current?.click();
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages((current) => current.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage(null);

    if (selectedImages.length === 0) {
      setFormMessage('Please upload at least one property image.');
      return;
    }

    setIsSubmittingForm(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('propertyType', propertyType);
      formData.append('price', price);
      formData.append('location', location);
      formData.append('address', address);
      selectedImages.forEach((file) => formData.append('images', file));

      const response = await fetch('/api/properties', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setFormMessage(error?.error || 'Failed to upload property.');
        return;
      }

      setFormMessage('Property created successfully.');
      setTitle('');
      setDescription('');
      setPropertyType('House');
      setPrice('');
      setLocation('');
      setAddress('');
      setSelectedImages([]);
      if (imageInputRef.current) imageInputRef.current.value = '';
      event.currentTarget.reset();
    } catch (error) {
      setFormMessage('Failed to upload property. Please try again.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactFormMessage(null);

    if (!contactName.trim() || !contactEmail.trim() || !contactText.trim()) {
      setContactFormMessage('Please fill in your name, email address, and message.');
      return;
    }

    setIsSubmittingContactForm(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          message: contactText,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setContactFormMessage(error?.error || 'Failed to send message. Please try again.');
        return;
      }

      setContactFormMessage('Message sent successfully. We will contact you shortly.');
      setContactName('');
      setContactEmail('');
      setContactText('');
    } catch (error) {
      setContactFormMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmittingContactForm(false);
    }
  };

  const handleConsultationSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConsultationFormMessage(null);

    if (!consultationName.trim() || !consultationEmail.trim() || !consultationDate || !consultationTime) {
      setConsultationFormMessage('Please provide your name, email, preferred date, and time.');
      return;
    }

    setIsSubmittingConsultationForm(true);

    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: consultationName,
          email: consultationEmail,
          preferredDate: consultationDate,
          preferredTime: consultationTime,
          notes: consultationNotes,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setConsultationFormMessage(error?.error || 'Failed to book consultation. Please try again.');
        return;
      }

      setConsultationFormMessage('Consultation request sent. We will confirm your booking by email.');
      setConsultationName('');
      setConsultationEmail('');
      setConsultationDate('');
      setConsultationTime('');
      setConsultationNotes('');
    } catch (error) {
      setConsultationFormMessage('Failed to book consultation. Please try again.');
    } finally {
      setIsSubmittingConsultationForm(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm shadow-slate-950/20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900">
              <Image src="/assets/jogo.jpeg" alt="JIDOR PROPERTIES logo" fill className="object-cover" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">JIDOR PROPERTIES</p>
              <p className="text-xs text-slate-500">Find homes. List spaces.</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
            <a className="transition hover:text-white" href="#home">Home</a>
            <a className="transition hover:text-white" href="#featured">Featured</a>
            <a className="transition hover:text-white" href="#agents">Agents</a>
            <a className="transition hover:text-white" href="#about">About</a>
            <a className="transition hover:text-white" href="#contact">Contact</a>
            <Link className="transition hover:text-white" href="/admin/leads">Leads</Link>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            <a className="rounded-full border border-slate-700 px-5 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white" href="#login">Sign In</a>
            <a className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400" href="#list">List Property</a>
          </div>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-200 lg:hidden"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
        </div>
      </header>
      {isMobileMenuOpen ? (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 px-6 py-4">
          <div className="space-y-3">
            <a className="block text-sm text-slate-200 transition hover:text-white" href="#home" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
            <a className="block text-sm text-slate-200 transition hover:text-white" href="#featured" onClick={() => setIsMobileMenuOpen(false)}>Featured</a>
            <a className="block text-sm text-slate-200 transition hover:text-white" href="#agents" onClick={() => setIsMobileMenuOpen(false)}>Agents</a>
            <a className="block text-sm text-slate-200 transition hover:text-white" href="#about" onClick={() => setIsMobileMenuOpen(false)}>About</a>
            <a className="block text-sm text-slate-200 transition hover:text-white" href="#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            <Link className="block text-sm text-slate-200 transition hover:text-white" href="/admin/leads" onClick={() => setIsMobileMenuOpen(false)}>Leads</Link>
            <div className="mt-3 flex flex-col gap-3">
              <a className="rounded-full border border-slate-700 px-5 py-3 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white text-center" href="#login" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </a>
              <a className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 text-center" href="#list" onClick={() => setIsMobileMenuOpen(false)}>
                List Property
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <section id="home" className="relative overflow-hidden border-b border-slate-800 pb-24 pt-28 sm:pt-32">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_50%)]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <div className="space-y-8">
            <div className="max-w-xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Discover Homes That Fit Your Life</p>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Find, buy, rent, or list verified properties with ease.
              </h1>
              <p className="text-lg leading-8 text-slate-300">
                JIDOR PROPERTIES connects buyers, renters and sellers with trusted agents and exclusive listings across Ghana.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl shadow-slate-950/30">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Location</label>
                  <select className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20">
                    <option>Any Location</option>
                    <option>Greater Accra</option>
                    <option>Ashanti</option>
                    <option>Western</option>
                    <option>Central</option>
                    <option>Eastern</option>
                    <option>Volta</option>
                    <option>Oti</option>
                    <option>Northern</option>
                    <option>North East</option>
                    <option>Savannah</option>
                    <option>Upper East</option>
                    <option>Upper West</option>
                    <option>Bono</option>
                    <option>Bono East</option>
                    <option>Ahafo</option>
                    <option>Western North</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Property Type</label>
                  <select className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20">
                    <option>Any Type</option>
                    <option>Apartment</option>
                    <option>House</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Price Range</label>
                  <select className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20">
                    <option>Any Price</option>
                    <option>GHS 500k+</option>
                    <option>GHS 1M+</option>
                  </select>
                </div>
                <button className="rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:opacity-95 sm:col-span-2 lg:col-auto">
                  Search Properties
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Properties', value: '2,500+' },
                { label: 'Verified Agents', value: '1,200+' },
                { label: 'Happy Clients', value: '6,800+' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-900/90 px-5 py-6 text-center shadow-sm shadow-slate-950/20">
                  <p className="text-3xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-950/40">
            <div className="relative h-[560px] w-full">
              <Image
                src="/assets/homehub.jpeg"
                alt="JIDOR PROPERTIES property preview"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Featured project</p>
                  <p className="text-xl font-semibold text-white">The Green Court, East Legon</p>
                </div>
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100">From GHS 1,800,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="border-b border-slate-800 bg-slate-950/90 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Featured Properties</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Explore handpicked homes.</h2>
            </div>
            <a className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white ring-1 ring-slate-700 transition hover:bg-slate-800" href="#">View All Properties</a>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {(properties.length > 0 ? properties.slice(0, 3) : [
              {
                id: 'sample-1',
                title: '4 Bedroom House',
                location: { text: 'Greater Accra' },
                price: 'GHS 2,500,000',
                propertyType: 'House',
                status: 'For Sale',
                images: [{ url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80' }],
              },
              {
                id: 'sample-2',
                title: '2 Bedroom Apartment',
                location: { text: 'Ashanti' },
                price: 'GHS 680,000',
                propertyType: 'Apartment',
                status: 'For Rent',
                images: [{ url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80' }],
              },
              {
                id: 'sample-3',
                title: '3 Bedroom Townhouse',
                location: { text: 'Volta' },
                price: 'GHS 1,200,000',
                propertyType: 'Townhouse',
                status: 'New Project',
                images: [{ url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80' }],
              },
            ]).map((property) => {
              const isRealProperty = Boolean(property.id);
              const label = property.status || 'For Sale';
              const imageUrl = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80';
              const priceText = property.price || 'Price on request';
              const locationText = property.location?.text || 'Unknown location';

              const card = (
                <article className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/90 shadow-xl shadow-slate-950/20 transition duration-200 hover:-translate-y-1 hover:border-amber-500/30 hover:bg-slate-900/95">
                  <div className="relative h-72 bg-slate-800">
                    <span className="absolute right-4 top-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-950">
                      {label}
                    </span>
                    <img
                      className="h-full w-full object-cover"
                      src={imageUrl}
                      alt={property.title}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent px-4 py-4">
                      <p className="text-sm font-semibold text-white">{property.title}</p>
                    </div>
                  </div>
                  <div className="space-y-4 px-6 py-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{property.title}</h3>
                      <p className="mt-1 text-sm text-slate-400">{locationText}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
                      <span>{priceText}</span>
                      <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-amber-300 transition group-hover:border-amber-400 group-hover:bg-amber-500/20 group-hover:text-amber-100">
                        View Project
                      </span>
                    </div>
                  </div>
                </article>
              );

              return isRealProperty ? (
                <Link key={property.id} href={`/properties/${property.id}`} className="group block">
                  {card}
                </Link>
              ) : (
                <div key={property.title + locationText}>{card}</div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="list" className="border-b border-slate-800 bg-slate-950/90 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">List Property</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Owners can upload property images directly.</h2>
            </div>
            <p className="max-w-xl text-sm text-slate-400 lg:text-right">
              Property owners can submit full listings with multiple photos and details directly from the website.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 grid gap-8 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Property Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="3 Bedroom Apartment"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Location</label>
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                  required
                >
                  <option value="">Select a region</option>
                  <option>Greater Accra</option>
                  <option>Ashanti</option>
                  <option>Western</option>
                  <option>Central</option>
                  <option>Eastern</option>
                  <option>Volta</option>
                  <option>Oti</option>
                  <option>Northern</option>
                  <option>North East</option>
                  <option>Savannah</option>
                  <option>Upper East</option>
                  <option>Upper West</option>
                  <option>Bono</option>
                  <option>Bono East</option>
                  <option>Ahafo</option>
                  <option>Western North</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Price</label>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="GHS 2,500,000"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(event) => setPropertyType(event.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option>House</option>
                  <option>Apartment</option>
                  <option>Townhouse</option>
                  <option>Land</option>
                  <option>Warehouse</option>
                  <option>Construction Site</option>
                  <option>Uncompleted House</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-white">Address</label>
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                placeholder="House 5, Adjiriganor Street"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-white">Property Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                placeholder="Describe the property in a few sentences."
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-white">Property Images</label>
              <p className="text-xs text-slate-500">Click the button below to upload one or more photos.</p>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleImagePickerOpen}
                  className="inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                >
                  Upload Images
                </button>
                {selectedImages.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setSelectedImages([])}
                    className="inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:text-white"
                  >
                    Clear All
                  </button>
                ) : null}
              </div>
              {selectedImages.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-slate-300">Selected {selectedImages.length} image(s).</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedImages.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
                        <p className="truncate text-sm text-slate-200">{file.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{Math.round(file.size / 1024)} KB</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="mt-3 text-xs font-semibold text-amber-300 transition hover:text-amber-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {formMessage ? (
              <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-200">
                {formMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmittingForm}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingForm ? 'Submitting...' : 'Create Listing'}
            </button>
          </form>
        </div>
      </section>

      <section id="agents" className="border-b border-slate-800 bg-slate-950/90 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Agent Directory</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Trusted experts for every property.</h2>
              <p className="mt-4 max-w-xl text-slate-400">
                Connect with verified agents, browse trusted advisors, and get personalized support for your next move.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { name: 'Kwame Mensah', role: 'Agent' },
                { name: 'Nina Amo', role: 'Agent' },
                { name: 'Karl Boateng', role: 'Agent' },
                { name: 'Alicia Addo', role: 'Agent' },
              ].map((agent) => (
                <div key={agent.name} className="rounded-3xl border border-slate-800 bg-slate-900/90 px-5 py-6 shadow-sm shadow-slate-950/20">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-lg text-amber-300">{agent.name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-white">{agent.name}</p>
                      <p className="text-sm text-slate-400">{agent.role}</p>
                    </div>
                  </div>
                  <button className="mt-6 w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="bg-slate-900/90 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6 rounded-[2rem] border border-slate-800 bg-slate-950/95 p-10 shadow-xl shadow-slate-950/20">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Our Family Connection</p>
              <h2 className="text-3xl font-semibold text-white">Part of the Jidor Group ecosystem.</h2>
              <p className="text-slate-400">
                JIDOR PROPERTIES is proud to be part of the Jidor Group of Companies, delivering construction, property development, and real estate services with trusted partners and verified listings.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-900 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Modern Pioneers Ltd</p>
              <p className="mt-3 text-lg font-semibold text-white">Building today, shaping tomorrow.</p>
              <a className="mt-5 inline-flex items-center rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400" href="#">
                Visit Website
              </a>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[
              { title: 'Verified Properties', text: 'Quality you can trust.' },
              { title: 'Transparent Process', text: 'Clear, honest and reliable.' },
              { title: 'Expert Support', text: 'We are here for you.' },
              { title: 'Secure Platform', text: 'Your data is protected.' },
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-800 bg-slate-900/90 px-6 py-7 shadow-sm shadow-slate-950/20">
                <p className="text-sm uppercase tracking-[0.25em] text-amber-300">{item.title}</p>
                <p className="mt-3 text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-slate-800 bg-slate-950/95 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Contact Us</p>
              <h2 className="text-3xl font-semibold text-white">Ready to find your perfect home?</h2>
              <p className="text-slate-400">Connect with our team to schedule a consultation, request a property tour, or list your space today.</p>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-xl shadow-slate-950/20">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Full Name"
                  name="name"
                  autoComplete="name"
                />
                <input
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Email Address"
                  type="email"
                  name="email"
                  autoComplete="email"
                />
              </div>
              <textarea
                value={contactText}
                onChange={(event) => setContactText(event.target.value)}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                rows={4}
                placeholder="Message"
                name="message"
              />
              {contactFormMessage ? <p className="text-sm text-slate-300">{contactFormMessage}</p> : null}
              <button
                type="submit"
                disabled={isSubmittingContactForm}
                className="w-full rounded-3xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingContactForm ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl px-6">
          <div className="rounded-[2rem] border border-amber-500/20 bg-gradient-to-r from-slate-900/90 to-slate-950/90 p-8 shadow-xl shadow-amber-500/10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_0.8fr] lg:items-center">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Book a Consultation</p>
                <h3 className="text-2xl font-semibold text-white">Schedule a free property consultation</h3>
                <p className="text-slate-400">
                  Speak with our team to review your needs, explore the best listings, and secure the right property investment in Ghana.
                </p>
              </div>
              <form onSubmit={handleConsultationSubmit} className="space-y-4 rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6 shadow-sm shadow-slate-950/20">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white">Full name</label>
                    <input
                      value={consultationName}
                      onChange={(event) => setConsultationName(event.target.value)}
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Your full name"
                      name="consultationName"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white">Email address</label>
                    <input
                      value={consultationEmail}
                      onChange={(event) => setConsultationEmail(event.target.value)}
                      type="email"
                      className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                      placeholder="you@example.com"
                      name="consultationEmail"
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Preferred date</label>
                  <input
                    value={consultationDate}
                    onChange={(event) => setConsultationDate(event.target.value)}
                    type="date"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Preferred time</label>
                  <input
                    value={consultationTime}
                    onChange={(event) => setConsultationTime(event.target.value)}
                    type="time"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Additional notes (optional)</label>
                  <textarea
                    value={consultationNotes}
                    onChange={(event) => setConsultationNotes(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-500/20"
                    placeholder="Tell us what type of property you are looking for."
                  />
                </div>
                {consultationFormMessage ? <p className="text-sm text-slate-300">{consultationFormMessage}</p> : null}
                <button
                  type="submit"
                  disabled={isSubmittingConsultationForm}
                  className="w-full rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmittingConsultationForm ? 'Booking...' : 'Book Consultation'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
