export type SampleProperty = {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  status: string;
  price: number;
  location: { text: string };
  address: { text: string };
  images: { url: string; caption: string }[];
};

export const sampleProperties: Record<string, SampleProperty> = {
  'sample-1': {
    id: 'sample-1',
    title: '4 Bedroom House',
    description: 'A bright family home in the Greater Accra Region with modern finishes and easy access to local amenities.',
    propertyType: 'House',
    status: 'For Sale',
    price: 2500000,
    location: { text: 'Greater Accra' },
    address: { text: 'Plot 12, Community Road' },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        caption: 'Front view',
      },
      {
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        caption: 'Living room',
      },
      {
        url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        caption: 'Dining area',
      },
    ],
  },
  'sample-2': {
    id: 'sample-2',
    title: '2 Bedroom Apartment',
    description: 'A modern apartment in the Ashanti Region, ideal for young professionals and investors.',
    propertyType: 'Apartment',
    status: 'For Rent',
    price: 680000,
    location: { text: 'Ashanti' },
    address: { text: 'Suite 8, City Tower' },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        caption: 'Apartment exterior',
      },
      {
        url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        caption: 'Bedroom',
      },
      {
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        caption: 'Living area',
      },
    ],
  },
  'sample-3': {
    id: 'sample-3',
    title: '3 Bedroom Townhouse',
    description: 'A spacious townhouse in the Volta Region with contemporary design and secure parking.',
    propertyType: 'Townhouse',
    status: 'New Project',
    price: 1200000,
    location: { text: 'Volta' },
    address: { text: 'Phase 2, Hillview Estate' },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        caption: 'Townhouse entrance',
      },
      {
        url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        caption: 'Living area',
      },
      {
        url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
        caption: 'Bedroom',
      },
    ],
  },
};

export const samplePropertyList = Object.values(sampleProperties);
export const getSampleProperty = (id: string) => sampleProperties[id];
