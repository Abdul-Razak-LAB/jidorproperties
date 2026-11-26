import { hasDatabase, prisma } from '@/lib/prisma';
import Link from 'next/link';

function asText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function AdminLeadsPage() {
  if (!hasDatabase || !prisma) {
    return (
      <main className="min-h-screen bg-white px-4 py-12 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Leads Inbox</h1>
          <p className="mt-3 text-slate-600">
            Database is not configured. Add a valid Neon Postgres DATABASE_URL to view saved leads.
          </p>
        </div>
      </main>
    );
  }

  let leads: Awaited<ReturnType<typeof prisma.emailQueue.findMany>> = [];
  let queryError: string | null = null;

  try {
    leads = await prisma.emailQueue.findMany({
      where: { templateId: { in: ['contact_form', 'consultation_booking', 'property_viewing'] } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  } catch (error) {
    const maybePrismaError = error as { code?: string; message?: string };
    if (maybePrismaError?.code === 'P2021') {
      queryError = 'EmailQueue table is missing in the database. Run `npx prisma db push` (or apply migrations) to create it.';
    } else {
      queryError = 'Unable to load leads right now. Please try again after checking the database connection.';
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-12 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Leads Inbox</h1>
          <p className="mt-2 text-sm text-slate-600">Stored in Neon via Prisma EmailQueue.</p>
          <p className="mt-3 text-xs text-emerald-700">Protected area. Admin authentication is required.</p>
          <div className="mt-4">
            <Link
              href="/admin"
              className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-500 hover:text-slate-950"
            >
              Open Admin Dashboard
            </Link>
          </div>
        </div>

        {queryError ? (
          <div className="rounded-2xl border border-amber-700/40 bg-amber-950/30 p-6 text-amber-100">
            {queryError}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
            No leads yet.
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => {
              const vars = lead.variables && typeof lead.variables === 'object' && !Array.isArray(lead.variables)
                ? (lead.variables as Record<string, unknown>)
                : {};

              const name = asText(vars.name) || 'Unknown';
              const email = asText(vars.email) || 'Unknown';
              const phone = asText(vars.phone);
              const propertyTitle = asText(vars.propertyTitle);
              const message = asText(vars.message);
              const preferredDate = asText(vars.preferredDate);
              const preferredTime = asText(vars.preferredTime);
              const notes = asText(vars.notes);

              return (
                <article key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                      {lead.templateId === 'property_viewing'
                        ? 'Property viewing'
                        : lead.templateId === 'consultation_booking'
                          ? 'Consultation'
                          : 'Contact'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>Status: {lead.status}</span>
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <p className="text-sm text-slate-700"><span className="text-slate-500">Name:</span> {name}</p>
                    <p className="text-sm text-slate-700"><span className="text-slate-500">Email:</span> {email}</p>
                    {phone ? <p className="text-sm text-slate-700"><span className="text-slate-500">Phone:</span> {phone}</p> : null}
                    {propertyTitle ? <p className="text-sm text-slate-700"><span className="text-slate-500">Property:</span> {propertyTitle}</p> : null}
                    {preferredDate ? <p className="text-sm text-slate-700"><span className="text-slate-500">Preferred date:</span> {preferredDate}</p> : null}
                    {preferredTime ? <p className="text-sm text-slate-700"><span className="text-slate-500">Preferred time:</span> {preferredTime}</p> : null}
                  </div>

                  {message ? (
                    <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      {message}
                    </p>
                  ) : null}

                  {notes ? (
                    <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      {notes}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
