import type { Metadata } from 'next';
import '../styles/globals.css';
import Footer from '@/components/Footer';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import WhatsAppButton from '@/components/WhatsAppButton';
import RouteBackButton from '@/components/RouteBackButton';
import PropertyShortlistTray from '@/components/PropertyShortlistTray';
import { getLocale } from '@/lib/getLocale';

export const metadata: Metadata = {
  title: 'JIDOR PROPERTIES',
  description: 'Premium real estate marketplace powered by Neon and Resend.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white text-slate-900">
        <div className="flex min-h-screen flex-col">
          <RouteBackButton />
          <div className="flex-1">{children}</div>
          <WhatsAppButton />
          <ScrollToTopButton />
          <PropertyShortlistTray locale={locale} />
          <Footer locale={locale} />
        </div>
      </body>
    </html>
  );
}
