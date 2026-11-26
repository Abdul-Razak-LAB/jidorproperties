import { cookies } from 'next/headers';
import { isLocale, type Locale } from '@/lib/i18n';

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get('jidor-locale')?.value;
  return isLocale(locale) ? locale : 'en';
}
