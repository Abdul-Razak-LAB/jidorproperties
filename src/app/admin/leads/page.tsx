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
      <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-semibold">Leads Inbox</h1>
          <p className="mt-3 text-slate-300">
            Database is not configured. Add a valid Neon Postgres DATABASE_URL to view saved leads.
          </p>
        </div>
      </main>
    );
  }

  const leads = await prisma.emailQueue.findMany({
    where: { templateId: { in: ['contact_form', 'consultation_booking'] } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h1 className="text-2xl font-semibold">Leads Inbox</h1>
          <p className="mt-2 text-sm text-slate-400">Stored in Neon via Prisma EmailQueue.</p>
          <p className="mt-3 text-xs text-amber-300">This page is currently unprotected. Add authentication before production use.</p>
          <div className="mt-4">
            <Link
              href="/admin/properties"
              className="inline-flex rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              Open Property Dashboard
            </Link>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
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
              const message = asText(vars.message);
              const preferredDate = asText(vars.preferredDate);
              const preferredTime = asText(vars.preferredTime);
              const notes = asText(vars.notes);

              return (
                <article key={lead.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                      {lead.templateId === 'consultation_booking' ? 'Consultation' : 'Contact'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Status: {lead.status}</span>
                      <span>{formatDate(lead.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <p className="text-sm text-slate-300"><span className="text-slate-500">Name:</span> {name}</p>
                    <p className="text-sm text-slate-300"><span className="text-slate-500">Email:</span> {email}</p>
                    {preferredDate ? <p className="text-sm text-slate-300"><span className="text-slate-500">Preferred date:</span> {preferredDate}</p> : null}
                    {preferredTime ? <p className="text-sm text-slate-300"><span className="text-slate-500">Preferred time:</span> {preferredTime}</p> : null}
                  </div>

                  {message ? (
                    <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
                      {message}
                    </p>
                  ) : null}

                  {notes ? (
                    <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
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
