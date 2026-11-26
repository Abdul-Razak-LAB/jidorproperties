export type ShortlistProperty = {
  id: string;
  title: string;
  status: string;
  propertyType: string;
  location: string;
  price: number;
  currency: string;
  imageUrl: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqm?: number | null;
};

export const SHORTLIST_LIMIT = 4;
export const SHORTLIST_EVENT = 'jidor-shortlist-change';

const STORAGE_KEY = 'jidor-property-shortlist';

export function readShortlist(): ShortlistProperty[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(stored)) return [];

    return stored.filter((item): item is ShortlistProperty =>
      item &&
      typeof item.id === 'string' &&
      typeof item.title === 'string' &&
      typeof item.location === 'string'
    ).slice(0, SHORTLIST_LIMIT);
  } catch {
    return [];
  }
}

export function writeShortlist(properties: ShortlistProperty[]) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(properties.slice(0, SHORTLIST_LIMIT)));
  } catch {
    // Keep the current page usable when browser storage is disabled.
  }

  window.dispatchEvent(new Event(SHORTLIST_EVENT));
}