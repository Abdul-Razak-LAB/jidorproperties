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
        url: '/assets/img_1.jpg',
        caption: 'Front view',
      },
      {
        url: '/assets/img_7.jpg',
        caption: 'Living room',
      },
      {
        url: '/assets/img_8.jpg',
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
        url: '/assets/2Bedroom.jpg',
        caption: 'Apartment exterior',
      },
      {
        url: '/assets/img_5.jpg',
        caption: 'Bedroom',
      },
      {
        url: '/assets/img_7.jpg',
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
        url: '/assets/img_5.jpg',
        caption: 'Townhouse entrance',
      },
      {
        url: '/assets/img_8.jpg',
        caption: 'Living area',
      },
      {
        url: '/assets/img_1.jpg',
        caption: 'Bedroom',
      },
    ],
  },
  'sample-4': {
    id: 'sample-4',
    title: 'Luxury Duplex',
    description: 'A contemporary duplex with airy interiors and premium finishes in a secure estate.',
    propertyType: 'Duplex',
    status: 'For Sale',
    price: 3200000,
    location: { text: 'Greater Accra' },
    address: { text: 'Palm Crescent, Cantonments' },
    images: [
      {
        url: '/assets/g1.png',
        caption: 'Duplex exterior',
      },
    ],
  },
  'sample-5': {
    id: 'sample-5',
    title: 'Warehouse Space',
    description: 'A stylish family home with a spacious compound and excellent natural lighting.',
    propertyType: 'House',
    status: 'New Project',
    price: 1850000,
    location: { text: 'Eastern' },
    address: { text: 'Oak Street, Ridge View' },
    images: [
      {
        url: '/assets/g2.png',
        caption: 'Family home exterior',
      },
    ],
  },
};

export const samplePropertyList = Object.values(sampleProperties);
export const getSampleProperty = (id: string) => sampleProperties[id];
