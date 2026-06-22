import type { Metadata } from 'next';
import '../styles/globals.css';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'JIDOR PROPERTIES',
  description: 'Premium real estate marketplace powered by Neon and Resend.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
