import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { translate, type Locale } from '@/lib/i18n';

export default function Footer({ locale }: { locale: Locale }) {
  const t = (text: string) => translate(locale, text);

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-800">JIDOR PROPERTIES</p>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            {t('A trusted real estate marketplace for verified homes, reliable agents, and secure listings across Ghana.')}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-800">{t('Explore')}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#home" className="transition hover:text-slate-950">{t('Home')}</Link>
              <Link href="#featured" className="transition hover:text-slate-950">{t('Properties')}</Link>
              <Link href="#list" className="transition hover:text-slate-950">{t('List Property')}</Link>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-800">{t('Company')}</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#about" className="transition hover:text-slate-950">{t('About')}</Link>
              <Link href="#agents" className="transition hover:text-slate-950">{t('Agents')}</Link>
              <Link href="#contact" className="transition hover:text-slate-950">{t('Contact')}</Link>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-800">{t('Support')}</p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:Jidorproperties@gmail.com" className="transition hover:text-slate-950">Jidorproperties@gmail.com</a>
              <a href="tel:+233000000000" className="transition hover:text-slate-950">+233 000 000 000</a>
              <Link href="#contact" className="transition hover:text-slate-950">{t('Get in touch')}</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 bg-white px-6 py-6 text-center text-sm text-slate-500">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} JIDOR PROPERTIES. {t('All rights reserved.')}</p>
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </footer>
  );
}
