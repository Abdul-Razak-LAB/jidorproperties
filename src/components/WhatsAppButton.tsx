'use client';

const whatsappUrl = 'https://wa.me/233593751113?text=Hello%20JIDOR%20PROPERTIES%2C%20I%20need%20help%20with%20a%20property.';

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
    >
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.9 11.9 0 0 0 12.02 0C5.4 0 .02 5.37.02 11.99c0 2.11.55 4.17 1.59 5.99L0 24l6.18-1.62A11.93 11.93 0 0 0 12.02 24c6.62 0 11.99-5.38 11.99-12 0-3.2-1.25-6.2-3.49-8.52ZM12.02 21.98a9.93 9.93 0 0 1-5.06-1.39l-.36-.21-3.67.96.98-3.58-.24-.37a9.9 9.9 0 0 1-1.52-5.4C2.15 6.49 6.5 2.14 12.02 2.14c2.65 0 5.13 1.03 7 2.91a9.84 9.84 0 0 1 2.89 6.98c0 5.52-4.38 9.95-9.89 9.95Zm5.44-7.43c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.66.15-.2.3-.76.97-.93 1.17-.17.2-.34.22-.63.07-.3-.15-1.25-.46-2.38-1.47a8.95 8.95 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.13-.13.3-.34.44-.51.14-.17.2-.29.3-.49.1-.2.05-.37-.03-.52-.07-.15-.66-1.6-.91-2.2-.24-.58-.48-.5-.66-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.46 0 1.44 1.07 2.84 1.22 3.04.15.2 2.1 3.21 5.08 4.5.71.31 1.26.5 1.69.64.71.23 1.35.2 1.86.12.57-.08 1.78-.73 2.03-1.44.25-.71.25-1.32.17-1.44-.07-.12-.27-.2-.57-.34Z" />
      </svg>
    </a>
  );
}
