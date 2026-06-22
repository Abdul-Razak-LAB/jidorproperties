import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">JIDOR PROPERTIES</p>
          <p className="max-w-xl text-sm leading-6 text-slate-400">
            A trusted real estate marketplace for verified homes, reliable agents, and secure listings across Ghana.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Explore</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#home" className="transition hover:text-white">Home</Link>
              <Link href="#featured" className="transition hover:text-white">Properties</Link>
              <Link href="#list" className="transition hover:text-white">List Property</Link>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Company</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="#about" className="transition hover:text-white">About</Link>
              <Link href="#agents" className="transition hover:text-white">Agents</Link>
              <Link href="#contact" className="transition hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">Support</p>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:Jidorproperties@gmail.com" className="transition hover:text-white">Jidorproperties@gmail.com</a>
              <a href="tel:+233000000000" className="transition hover:text-white">+233 000 000 000</a>
              <Link href="#contact" className="transition hover:text-white">Get in touch</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 bg-slate-950/90 px-6 py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} JIDOR PROPERTIES. All rights reserved.</p>
      </div>
    </footer>
  );
}
