import Image from 'next/image';
import Link from 'next/link';
import { ensurePropertyTypeImageTable, hasDatabase, prisma } from '@/lib/prisma';
import { samplePropertyList } from '@/lib/sampleProperties';
import RecentPropertiesCarousel from '@/components/RecentPropertiesCarousel';
import MobileNavMenu from '@/components/MobileNavMenu';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getLocale } from '@/lib/getLocale';
import { translate } from '@/lib/i18n';

type DashboardProperty = {
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

type PropertyTypeGalleryImage = {
  id: string;
  propertyType: string;
  url: string;
  caption?: string | null;
};

function asNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value && typeof value === 'object' && 'toString' in value) {
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asLocation(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Unknown location';
  const input = value as Record<string, unknown>;
  const text = input.text;
  return typeof text === 'string' && text.trim() ? text.trim() : 'Unknown location';
}

function formatMoney(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  }).format(value);
}

function revenueLabel(value: number, locale: string) {
  if (value >= 1000000) return `GHc ${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `GHc ${(value / 1000).toFixed(0)}K`;
  return formatMoney(value, locale);
}

function taskPillClasses(level: string) {
  const normalized = level.toLowerCase();
  if (normalized === 'high') return 'bg-rose-100 text-rose-700';
  if (normalized === 'medium') return 'bg-amber-100 text-amber-700';
  return 'bg-sky-100 text-sky-700';
}

function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const props = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (name === 'home') return <svg {...props}><path d="M3 11.5l9-7 9 7" /><path d="M5 10.5V20h14v-9.5" /><path d="M9 20v-6h6v6" /></svg>;
  if (name === 'building') return <svg {...props}><path d="M4 20V5h10v15" /><path d="M14 20V9h6v11" /><path d="M8 9h2" /><path d="M8 13h2" /><path d="M8 17h2" /><path d="M17 13h1" /><path d="M17 17h1" /></svg>;
  if (name === 'users') return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a3 3 0 0 1 0 5.74" /></svg>;
  if (name === 'chart') return <svg {...props}><path d="M3 3v18h18" /><path d="M8 15l3-3 3 2 5-6" /><path d="M16 8h3v3" /></svg>;
  if (name === 'file') return <svg {...props}><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" /><path d="M14 2v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></svg>;
  if (name === 'check') return <svg {...props}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
  if (name === 'message') return <svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
  if (name === 'search') return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>;
  if (name === 'menu') return <svg {...props}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>;
  return <svg {...props}><circle cx="12" cy="12" r="8" /></svg>;
}

async function getProperties(): Promise<DashboardProperty[]> {
  if (!hasDatabase || !prisma) {
    return samplePropertyList.slice(0, 6).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      propertyType: item.propertyType,
      location: item.location.text,
      price: item.price,
      currency: 'GHS',
      imageUrl: item.images[0]?.url || '/assets/img_1.jpg',
    }));
  }

  try {
    const rows = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    });

    if (rows.length === 0) {
      return samplePropertyList.slice(0, 6).map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        propertyType: item.propertyType,
        location: item.location.text,
        price: item.price,
        currency: 'GHS',
        imageUrl: item.images[0]?.url || '/assets/img_1.jpg',
      }));
    }

    return rows.map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status || 'For Sale',
      propertyType: item.propertyType || 'Residential',
      location: asLocation(item.location),
      price: asNumber(item.price),
      currency: item.currency || 'GHS',
      imageUrl: item.images[0]?.url || '/assets/img_1.jpg',
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      areaSqm: item.areaSqm,
    }));
  } catch {
    return samplePropertyList.slice(0, 6).map((item) => ({
      id: item.id,
      title: item.title,
      status: item.status,
      propertyType: item.propertyType,
      location: item.location.text,
      price: item.price,
      currency: 'GHS',
      imageUrl: item.images[0]?.url || '/assets/img_1.jpg',
    }));
  }
}

async function getPropertyTypeImages() {
  if (!hasDatabase || !prisma) return {} as Record<string, PropertyTypeGalleryImage[]>;

  try {
    await ensurePropertyTypeImageTable();
    const images = await prisma.$queryRaw<PropertyTypeGalleryImage[]>`
      SELECT "id", "propertyType", "url", "caption"
      FROM "PropertyTypeImage"
      ORDER BY "propertyType" ASC, "sortOrder" ASC, "createdAt" ASC
    `;
    return images.reduce<Record<string, PropertyTypeGalleryImage[]>>((groups, image) => {
      const typeKey = image.propertyType.trim().toLowerCase();
      if (!typeKey) return groups;
      groups[typeKey] ||= [];
      groups[typeKey].push(image);
      return groups;
    }, {});
  } catch (error) {
    console.error('Failed to load property type images', error);
    return {} as Record<string, PropertyTypeGalleryImage[]>;
  }
}

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage(props: HomePageProps) {
  const [locale, resolvedSearchParams] = await Promise.all([getLocale(), props.searchParams]);
  const t = (text: string) => translate(locale, text);
  const rawQuery = resolvedSearchParams?.q as string | string[] | undefined;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery || '').trim();
  const normalizedQuery = query.toLowerCase();

  const [properties, propertyTypeImages] = await Promise.all([getProperties(), getPropertyTypeImages()]);
  const filteredProperties = normalizedQuery
    ? properties.filter((item) => {
      return [item.title, item.location, item.propertyType, item.status].some((field) => field.toLowerCase().includes(normalizedQuery));
    })
    : properties;

  const publishedCount = properties.filter((item) => item.status.toLowerCase().includes('sale') || item.status.toLowerCase().includes('published')).length;
  const rentCount = properties.filter((item) => item.status.toLowerCase().includes('rent')).length;
  const totalRevenue = properties.reduce((sum, item) => sum + item.price, 0);

  const metricCards = [
    { label: t('Total Properties'), value: String(properties.length), trend: `12% ${t('from last month')}`, accent: 'bg-sky-100 text-sky-700' },
    { label: t('Total Clients'), value: String(Math.max(86, properties.length * 14)), trend: `8% ${t('from last month')}`, accent: 'bg-amber-100 text-amber-700' },
    { label: t('Active Deals'), value: String(Math.max(24, publishedCount + rentCount)), trend: `15% ${t('from last month')}`, accent: 'bg-emerald-100 text-emerald-700' },
    { label: t('Total Revenue'), value: revenueLabel(totalRevenue, locale), trend: `18% ${t('from last month')}`, accent: 'bg-violet-100 text-violet-700' },
  ];

  const sidebarItems = [
    { label: t('Home'), icon: 'home', href: '/', active: true },
    { label: t('Properties'), icon: 'building', href: '/admin/properties' },
    { label: t('Clients'), icon: 'users', href: '/admin/clients' },
    { label: t('Featured'), icon: 'chart', href: '#featured' },
    { label: t('Leases'), icon: 'file', href: '#' },
    { label: t('About'), icon: 'file', href: '#about' },
    { label: t('Services'), icon: 'check', href: '#services' },
    { label: t('Reports'), icon: 'chart', href: '/admin' },
    { label: t('Contact Us'), icon: 'message', href: '#contact' },
  ];

  const quickActions = [
    { label: t('Add Property'), icon: 'building', href: '/admin/properties?add=1' },
    { label: t('Add Client'), icon: 'users', href: '/admin/leads' },
    { label: t('New Deal'), icon: 'chart', href: '/admin' },
    { label: t('Create Invoice'), icon: 'file', href: '/admin' },
    { label: t('Add Task'), icon: 'check', href: '/admin' },
    { label: t('View Reports'), icon: 'chart', href: '/admin' },
  ];

  const featuredAgents = [
    {
      name: 'Nana Ama Owusu',
      agency: 'Jidor Properties Ghana',
      location: 'Accra, Greater Accra',
      description: 'Expert in premium residential listings with fast client matching and negotiation support.',
      imageUrl: '/assets/agent-portrait-1.svg',
      rating: 4.8,
      reviews: 127,
      experience: 6,
    },
    {
      name: 'Kojo Mensah',
      agency: 'Jidor Properties Ghana',
      location: 'Takoradi, Western',
      description: 'Focused on office and retail spaces for growing businesses across Accra.',
      imageUrl: '/assets/agent-portrait-2.svg',
      rating: 4.8,
      reviews: 76,
      experience: 3,
    },
    {
      name: 'Aba Diman',
      agency: 'Jidor Properties Ghana',
      location: 'Lakeside, Accra',
      description: 'Helps buyers and renters find the right property quickly with personalized guidance.',
      imageUrl: '/assets/agent-portrait-3.svg',
      rating: 4.8,
      reviews: 25,
      experience: 2,
    },
  ];

  const testimonials = [
    {
      name: 'Samuel A.',
      title: 'Property Owner',
      quote: 'Jidor Properties helped me sell my home faster than expected with exceptional support every step of the way.',
    },
    {
      name: 'Esi K.',
      title: 'First-time Renter',
      quote: 'The team made finding the perfect apartment easy and stress-free. Their communication was excellent.',
    },
    {
      name: 'Yaw D.',
      title: 'Real Estate Investor',
      quote: 'I trust Jidor for their market insight and reliable agents. They delivered strong results for my portfolio.',
    },
  ];

  const popularPlaces = [
    { title: 'East Legon', description: 'Premium homes and quick access to Accra’s business districts.', imageUrl: '/assets/luxury.png' },
    { title: 'Dansoman', description: 'Family-friendly neighbourhoods with strong rental demand.', imageUrl: '/assets/2Bedroom.jpg' },
    { title: 'Spintex Road', description: 'Growing residential and commercial developments close to major highways.', imageUrl: '/assets/img_7.jpg' },
    { title: 'Airport City', description: 'Modern apartments and high-value investment opportunities.', imageUrl: '/assets/img_8.jpg' },
  ];

  const upcomingTasks = [
    { title: 'Follow up with Kwame Asare', meta: 'Regarding property #JDOR-1024', date: 'May 24, 2024', level: 'High' },
    { title: 'Inspection - East Legon Property', meta: 'Property #JDOR-2056', date: 'May 25, 2024', level: 'Medium' },
    { title: 'Prepare Lease Agreement', meta: 'For client: Ama Serwaa', date: 'May 27, 2024', level: 'Low' },
  ];

  const propertyTypeGallery = Object.values(
    properties.reduce<Record<string, DashboardProperty>>((acc, property) => {
      if (!acc[property.propertyType]) acc[property.propertyType] = property;
      return acc;
    }, {})
  ).map((property) => ({
    ...property,
    typeImages: propertyTypeImages[property.propertyType.trim().toLowerCase()] || [],
  }));

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-none flex-col lg:min-h-screen lg:flex-row">
        <div className="border-b border-slate-200 bg-white p-4 text-slate-900 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white">
              <Image src="/assets/final-jidor-logo.jpeg" alt="Jidor Properties" width={180} height={180} className="h-full w-full object-contain" priority />
            </div>
            <MobileNavMenu sidebarItems={sidebarItems} query={query} locale={locale} />
          </div>
        </div>

        <aside className="hidden lg:block lg:w-[280px] lg:flex-shrink-0">
          <div className="border-b border-slate-200 bg-white p-4 text-slate-900 lg:sticky lg:top-0 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-5">
            <div className="mx-auto w-full max-w-[240px] rounded-2xl border border-slate-200 bg-white p-3 lg:max-w-none lg:p-4">
              <Image src="/assets/final-jidor-logo.jpeg" alt="Jidor Properties" width={280} height={110} className="h-auto w-full object-contain" priority />
            </div>

            <nav className="mt-6 space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.label}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${item.active ? 'bg-amber-500 font-semibold text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}
                  href={item.href}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="mt-6 hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:block">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{t('Account')}</p>
              <p className="mt-2 text-sm font-semibold">Abdul Razak</p>
              <p className="text-xs text-slate-500">{t('Admin')}</p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1380px]">
          <header className="hidden flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:flex xl:flex-nowrap">
            <div className="w-full max-w-2xl xl:w-auto xl:flex-1">
              <form action="/" method="get" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400">
                <Icon name="search" className="h-4 w-4" />
                <input
                  name="q"
                  defaultValue={query}
                  type="search"
                  placeholder={t('Search properties, locations...')}
                  className="min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  aria-label={t('Search properties')}
                />
                <button type="submit" className="rounded-md bg-[#0b2d67] px-3 py-1 text-xs font-semibold text-white hover:bg-[#12397d]">{t('Search')}</button>
              </form>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span>{t('Welcome back.')}</span>
              <LanguageSwitcher locale={locale} />
            </div>
          </header>

          <section className="space-y-5 p-3 sm:p-5 lg:p-6 xl:p-8">
            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="relative h-[56vw] min-h-[200px] max-h-[440px] w-full sm:h-[46vw] lg:h-[340px] xl:h-[420px]">
                <Image
                  src="/assets/dashboard.png"
                  alt="Dashboard banner"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, (max-width: 1536px) 82vw, 1380px"
                  className="object-contain object-center md:object-cover"
                  priority
                />
              </div>
            </article>

            <section id="about" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 sm:rounded-3xl sm:p-6">
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-600">{t('Why Choose Jidor')}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{t('Built for real estate growth in Ghana')}</h2>
                  <p className="mt-4 text-slate-600">
                    {t('Jidor Properties helps you manage listings, connect with buyers and renters, and keep your agency organized with modern tools that work in the local market.')}
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">{t('Local market expertise')}</p>
                      <p className="mt-2 text-sm text-slate-600">{t('Designed for Ghanaian buyers and sellers so your listings feel relevant.')}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">{t('Fast property discovery')}</p>
                      <p className="mt-2 text-sm text-slate-600">{t('Search, filter and review listings quickly from a clean dashboard experience.')}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">{t('Lead-ready workflows')}</p>
                      <p className="mt-2 text-sm text-slate-600">{t('Capture client interest, manage inquiries, and keep follow-ups on track.')}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">{t('Modern admin tools')}</p>
                      <p className="mt-2 text-sm text-slate-600">{t('Manage your inventory, clients, and reports in one consistent admin suite.')}</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="rounded-[2rem] border border-slate-200 bg-[#0b2d67] p-6 text-white">
                    <h3 className="text-xl font-semibold">{t('Trusted by local agencies')}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-100/85">{t('A centralized workspace for listings, leads, and client engagement improves productivity across teams.')}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-3xl font-semibold text-[#0b2d67]">40+</p>
                      <p className="mt-2 text-sm text-slate-600">{t('Properties added per week')}</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-3xl font-semibold text-[#0b2d67]">95%</p>
                      <p className="mt-2 text-sm text-slate-600">{t('Lead response rate improved with faster workflows')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 sm:rounded-3xl sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">{t('Part of the Jidor Group ecosystem')}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{t('Our Family Connection')}</h2>
                </div>

                <div className="grid gap-5">
                  <p className="leading-7 text-slate-600">
                    {t('JIDOR PROPERTIES is proud to be part of the Jidor Group of Companies, delivering construction, property development, and real estate services with trusted partners and verified listings.')}
                  </p>

                  <article className="rounded-3xl border border-amber-200 bg-[#0b2d67] p-5 text-white sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">MODERN PIONEERS LTD</p>
                    <h3 className="mt-3 text-xl font-semibold sm:text-2xl">{t('Building Today, Shaping Tomorrow')}</h3>
                    <a
                      href="#"
                      className="mt-5 inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
                    >
                      {t('Visit Website')}
                    </a>
                  </article>
                </div>
              </div>
            </section>

            <section id="services" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 sm:rounded-3xl sm:p-6">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-600">{t('Meet Our Featured Expert Agents')}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{t('Trusted professionals for every client need')}</h2>
                  <p className="mt-4 max-w-2xl text-slate-600">
                    {t('Our agents combine local market knowledge with responsive service to help sellers, buyers, and renters move confidently.')}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredAgents.map((agent) => (
                    <article key={agent.name} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                      <div className="p-5">
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border border-amber-200 bg-slate-100 sm:h-16 sm:w-16">
                            <Image src={agent.imageUrl} alt={agent.name} fill className="object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">{agent.name}</p>
                            <p className="text-sm text-slate-500">{agent.agency}</p>
                            <p className="mt-1 text-sm text-amber-600">{agent.location}</p>
                          </div>
                        </div>
                        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-amber-500">
                              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                            </div>
                            <span className="font-semibold">{agent.rating.toFixed(1)}</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-500">({agent.reviews}) {t('reviews')}</p>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm font-medium text-slate-700">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-2xl font-semibold text-[#0b2d67]">{agent.experience}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('Years')}</p>
                          </div>
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-2xl font-semibold text-[#0b2d67]">{agent.rating.toFixed(1)}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('Rating')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-slate-200 bg-slate-50 p-4 text-center">
                        <Link href="#" className="inline-flex w-full items-center justify-center rounded-2xl border border-amber-500 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50">
                          {t('Profile')}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section id="contact" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 sm:rounded-3xl sm:p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-600">{t('What Our Users Say')}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{t('Trusted feedback from our community')}</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {testimonials.map((testimonial) => (
                    <article key={testimonial.name} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm leading-7 text-slate-700">“{t(testimonial.quote)}”</p>
                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <p className="text-sm font-semibold text-slate-900">{testimonial.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t(testimonial.title)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section id="featured" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 sm:rounded-3xl sm:p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-600">{t('Property Type Gallery')}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{t('Browse featured property types')}</h2>
                  <p className="mt-3 max-w-2xl text-slate-600">{t('See the available property types and sample images from your current featured listings.')}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {propertyTypeGallery.map((property) => (
                    <article key={property.propertyType} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                      <div className={`relative grid aspect-[4/3] w-full overflow-hidden ${property.typeImages.length > 1 ? 'grid-cols-2 grid-rows-2' : ''}`}>
                        {(property.typeImages.length > 0
                          ? property.typeImages.slice(0, 4)
                          : [{ id: property.id, url: property.imageUrl, caption: property.title }]
                        ).map((image, index, galleryImages) => (
                          <div key={image.id} className={`relative min-h-0 ${galleryImages.length === 3 && index === 0 ? 'row-span-2' : ''}`}>
                            <Image
                              src={image.url}
                              alt={image.caption || `${property.propertyType} property type image ${index + 1}`}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                              unoptimized={image.url.startsWith('/uploads/')}
                              className="object-cover"
                            />
                            {index === 0 ? (
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent px-4 py-3 text-white">
                                <p className="text-sm font-semibold uppercase tracking-[0.12em]">{property.propertyType}</p>
                                {!property.typeImages.length ? <p className="mt-1 text-xs text-slate-200 line-clamp-1">{property.title}</p> : null}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/70 sm:rounded-3xl sm:p-6">
              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-amber-600">{t('Popular Places to Live')}</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{t('Explore top neighbourhoods with great listings')}</h2>
                  <p className="mt-3 max-w-2xl text-slate-600">{t('Discover the most sought-after areas for buyers and renters, handpicked for comfort, convenience, and investment potential.')}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {popularPlaces.map((place) => (
                    <article key={place.title} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                      <div className="relative h-44 overflow-hidden bg-slate-200">
                        <Image src={place.imageUrl} alt={place.title} fill className="object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-lg font-semibold text-slate-900">{place.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{t(place.description)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.7fr_1fr] xl:grid-cols-[2.1fr_1fr]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {metricCards.map((card) => (
                    <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${card.accent}`}>{card.label}</div>
                      <p className="mt-3 text-3xl font-semibold text-[#0b2d67]">{card.value}</p>
                      <p className="mt-2 text-xs text-emerald-600">{card.trend}</p>
                    </article>
                  ))}
                </div>

                {query && (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    {t('Showing')} {filteredProperties.length} {t(filteredProperties.length === 1 ? 'result' : 'results')} {t('for')} &quot;{query}&quot;
                  </div>
                )}

                <RecentPropertiesCarousel properties={filteredProperties.slice(0, 8)} locale={locale} />

                {query && filteredProperties.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    {t('No properties found. Try another keyword.')}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <h2 className="text-xl font-semibold text-[#0b2d67]">{t('Quick Actions')}</h2>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {quickActions.map((action) => (
                      <Link
                        key={action.label}
                        href={action.href}
                        className="rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700 transition hover:border-[#0b2d67] hover:text-[#0b2d67] flex items-center justify-center gap-2"
                      >
                        <Icon name={action.icon} className="h-4 w-4" />
                        <span>{action.label}</span>
                      </Link>
                    ))}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[#0b2d67]">{t('Upcoming Tasks')}</h2>
                    <a className="text-sm font-semibold text-amber-600" href="#">{t('View All')}</a>
                  </div>
                  <div className="mt-4 space-y-3">
                    {upcomingTasks.map((task) => (
                      <div key={task.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-semibold text-slate-800">{t(task.title)}</p>
                        <p className="mt-1 text-xs text-slate-500">{t(task.meta)}</p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-slate-500">{task.date}</span>
                          <span className={`rounded-full px-2 py-1 font-semibold ${taskPillClasses(task.level)}`}>{t(task.level)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          </section>
          </div>
        </div>
      </div>
    </main>
  );
}
