'use client';

import Link from 'next/link';
import { useRef } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { translate, type Locale } from '@/lib/i18n';

type SidebarItem = {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
};

type MobileNavMenuProps = {
  sidebarItems: SidebarItem[];
  query: string;
  locale: Locale;
};

function Icon({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
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

export default function MobileNavMenu({ sidebarItems, query, locale }: MobileNavMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const t = (text: string) => translate(locale, text);

  const closeMenu = () => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details ref={detailsRef} className="group mt-0">
      <summary aria-label={t('Menu')} className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex h-9 w-9 items-center justify-center text-slate-700">
          <Icon name="menu" />
        </span>
        <span className="hidden sm:inline">Menu</span>
      </summary>
      <div className="mt-3 px-1 text-slate-700">
        <nav className="grid gap-2">
          {sidebarItems.map((item) => (
            <Link
              key={`mobile-${item.label}`}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${item.active ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
              href={item.href}
              onClick={closeMenu}
            >
              <Icon name={item.icon} className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-3 text-slate-700">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{t('Account')}</p>
          <p className="mt-2 text-sm font-semibold">Abdul Razak</p>
          <p className="text-xs text-slate-500">Admin</p>
        </div>
      </div>
      <div className="mt-3">
        <LanguageSwitcher locale={locale} />
      </div>
      <form action="/" method="get" className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
        <Icon name="search" className="h-4 w-4" />
        <input
          name="q"
          defaultValue={query}
          type="search"
          placeholder={t('Search properties, locations...')}
          className="min-w-0 flex-1 bg-transparent text-slate-700 placeholder:text-slate-400 focus:outline-none"
          aria-label={t('Search properties')}
        />
        <button type="submit" className="rounded-md bg-[#0b2d67] px-2 py-1 text-xs font-semibold text-white hover:bg-[#123b85]">{t('Go')}</button>
      </form>
    </details>
  );
}
