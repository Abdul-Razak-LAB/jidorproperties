'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function RouteBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (!pathname || pathname === '/') return null;

  const handleBack = () => {
    try {
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
        // Use the native history.back() which is more reliable across environments
        window.history.back();
        return;
      }
    } catch (err) {
      // fallthrough to router.push
    }

    router.push('/');
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="fixed left-4 top-4 z-[70] inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-md shadow-slate-300/30 backdrop-blur transition hover:border-slate-300 hover:text-slate-900"
      aria-label="Go back"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      <span>Go back</span>
    </button>
  );
}
