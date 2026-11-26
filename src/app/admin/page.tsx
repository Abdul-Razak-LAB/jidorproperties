import Link from 'next/link';
import Image from 'next/image';
import { hasDatabase, prisma } from '@/lib/prisma';

type LeadRow = {
  id: string;
  templateId: string | null;
  status: string;
  createdAt: Date;
  variables: unknown;
};

type PropertyRow = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  location: unknown;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

function getLocationText(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Unknown';
  const candidate = value as Record<string, unknown>;
  const fromText = candidate.text;
  if (typeof fromText === 'string' && fromText.trim()) return fromText.trim();
  const fromCity = candidate.city;
  if (typeof fromCity === 'string' && fromCity.trim()) return fromCity.trim();
  return 'Unknown';
}

function dayKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dayLabel(value: Date) {
  return new Intl.DateTimeFormat('en-GB', { month: 'short', day: 'numeric' }).format(value);
}

export default async function AdminDashboardPage() {
  if (!hasDatabase || !prisma) {
    return (
      <main className="min-h-screen bg-white px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="mt-3 text-slate-700">
            Database is not configured. Add a valid DATABASE_URL to unlock reports.
          </p>
        </div>
      </main>
    );
  }

  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  let properties: PropertyRow[] = [];
  let propertyError: string | null = null;

  try {
    properties = (await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        location: true,
      },
    })) as PropertyRow[];
  } catch (error) {
    propertyError = 'Unable to load properties from the database. Please check your DATABASE_URL and connection.';
  }

  let leads: LeadRow[] = [];
  let leadError: string | null = null;

  try {
    leads = (await prisma.emailQueue.findMany({
      where: { templateId: { in: ['contact_form', 'consultation_booking', 'property_viewing'] } },
      orderBy: { createdAt: 'desc' },
      take: 800,
      select: {
        id: true,
        templateId: true,
        status: true,
        createdAt: true,
        variables: true,
      },
    })) as LeadRow[];
  } catch (error) {
    const maybePrismaError = error as { code?: string };
    if (maybePrismaError?.code === 'P2021') {
      leadError = 'Leads table missing. Run prisma db push to include EmailQueue in reports.';
    } else {
      leadError = 'Unable to read leads for report generation.';
    }
  }

  const publishedProperties = properties.filter((item) => item.status.toLowerCase() === 'published').length;
  const draftProperties = properties.filter((item) => item.status.toLowerCase() === 'draft').length;
  const soldProperties = properties.filter((item) => item.status.toLowerCase() === 'sold').length;
  const addedLast30 = properties.filter((item) => item.createdAt >= since30).length;

  const totalLeads = leads.length;
  const leadsLast30 = leads.filter((item) => item.createdAt >= since30).length;
  const consultations = leads.filter((item) => ['consultation_booking', 'property_viewing'].includes(item.templateId || '')).length;
  const contacts = leads.filter((item) => item.templateId === 'contact_form').length;

  const publishRate = properties.length > 0 ? Math.round((publishedProperties / properties.length) * 100) : 0;
  const consultationShare = totalLeads > 0 ? Math.round((consultations / totalLeads) * 100) : 0;

  const statusBuckets = new Map<string, number>();
  for (const item of properties) {
    const key = item.status || 'unknown';
    statusBuckets.set(key, (statusBuckets.get(key) || 0) + 1);
  }
  const statusDistribution = Array.from(statusBuckets.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const locationBuckets = new Map<string, number>();
  for (const item of properties) {
    const key = getLocationText(item.location);
    locationBuckets.set(key, (locationBuckets.get(key) || 0) + 1);
  }
  const topLocations = Array.from(locationBuckets.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const leadByDay = new Map<string, number>();
  for (const lead of leads) {
    if (lead.createdAt < since14) continue;
    const key = dayKey(lead.createdAt);
    leadByDay.set(key, (leadByDay.get(key) || 0) + 1);
  }

  const trendDays: { label: string; count: number }[] = [];
  for (let index = 13; index >= 0; index -= 1) {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    value.setDate(value.getDate() - index);
    const key = dayKey(value);
    trendDays.push({ label: dayLabel(value), count: leadByDay.get(key) || 0 });
  }

  const maxTrend = trendDays.reduce((max, item) => Math.max(max, item.count), 0) || 1;

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white sm:rounded-3xl">
          <div className="relative w-full bg-slate-100">
            <Image
              src="/assets/dashboard.png"
              alt="Jidor Properties dashboard banner"
              width={2000}
              height={800}
              priority
              sizes="100vw"
              className="h-auto w-full"
            />
            <div className="absolute inset-0 hidden bg-gradient-to-r from-slate-950/45 via-slate-950/5 to-transparent sm:block" />
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4 p-4 sm:p-6 lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Operations Intelligence</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Admin Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-700">
                Comprehensive performance report across inventory, lead generation, and conversion quality.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/properties" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-500 hover:text-slate-900">
                Open Property Catalog
              </Link>
              <Link href="/admin/leads" className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-500 hover:text-slate-900">
                Open Leads Inbox
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Properties</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{properties.length}</p>
            <p className="mt-2 text-xs text-slate-600">{addedLast30} added in last 30 days</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Publish Rate</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-700">{publishRate}%</p>
            <p className="mt-2 text-xs text-slate-600">{publishedProperties} published, {draftProperties} draft</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lead Volume</p>
            <p className="mt-3 text-3xl font-semibold text-cyan-700">{totalLeads}</p>
            <p className="mt-2 text-xs text-slate-600">{leadsLast30} in last 30 days</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Consultation Share</p>
            <p className="mt-3 text-3xl font-semibold text-amber-700">{consultationShare}%</p>
            <p className="mt-2 text-xs text-slate-600">{consultations} consultation/viewing, {contacts} contact</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Lead Trend Report (14 days)</h2>
            <p className="mt-1 text-sm text-slate-600">Daily inbound demand pattern from contact and consultation forms.</p>
            <div className="mt-5 space-y-3">
              {trendDays.map((item) => (
                <div key={item.label} className="grid grid-cols-[70px_1fr_44px] items-center gap-3">
                  <span className="text-xs text-slate-600">{item.label}</span>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{ width: `${Math.max(8, Math.round((item.count / maxTrend) * 100))}%` }}
                    />
                  </div>
                  <span className="text-right text-xs text-slate-700">{item.count}</span>
                </div>
              ))}
            </div>
            {leadError ? (
              <p className="mt-4 rounded-xl border border-amber-700/40 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">{leadError}</p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Inventory Health</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span>Published</span>
                <span>{publishedProperties}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span>Draft</span>
                <span>{draftProperties}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span>Sold</span>
                <span>{soldProperties}</span>
              </div>
            </div>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">Top Locations</h3>
            <div className="mt-3 space-y-2">
              {topLocations.length === 0 ? (
                <p className="text-sm text-slate-500">No location data yet.</p>
              ) : (
                topLocations.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                    <span>{item.name}</span>
                    <span>{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Comprehensive Report Summary</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                Inventory pipeline is at <span className="font-semibold text-slate-900">{publishRate}% publish readiness</span> with {properties.length} total listings.
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                Lead intake produced <span className="font-semibold text-slate-900">{leadsLast30} leads in 30 days</span>, with consultation share at {consultationShare}%.
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                Recommendation: prioritize high-demand locations and convert draft listings to published to improve lead-to-listing match.
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <div className="mt-4 space-y-3">
              {properties.slice(0, 5).map((property) => (
                <div key={property.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
                  <p className="font-medium text-slate-900">{property.title}</p>
                  <p className="mt-1 text-slate-600">{getLocationText(property.location)} - {property.status || 'unknown'} - {formatDate(property.createdAt)}</p>
                </div>
              ))}
              {properties.length === 0 ? <p className="text-sm text-slate-500">No activity yet.</p> : null}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:rounded-3xl sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Status Distribution</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {statusDistribution.map((item) => (
              <div key={item.name} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                <p className="uppercase tracking-[0.14em] text-slate-500">{item.name}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.count}</p>
              </div>
            ))}
            {statusDistribution.length === 0 ? <p className="text-sm text-slate-500">No status report available.</p> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
