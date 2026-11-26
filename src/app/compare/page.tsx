import PropertyComparison from '@/components/PropertyComparison';
import { getLocale } from '@/lib/getLocale';

export default async function ComparePage() {
  const locale = await getLocale();
  return <PropertyComparison locale={locale} />;
}