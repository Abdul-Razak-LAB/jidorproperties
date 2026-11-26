import type { ReactNode } from 'react';
import { requireAdmin } from '@/lib/adminSession';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <>
      <form action="/api/auth/logout" method="post" className="fixed right-4 top-4 z-[70]">
        <button type="submit" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
          Sign out
        </button>
      </form>
      {children}
    </>
  );
}
