import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, prisma } from '@/lib/prisma';
import { samplePropertyList } from '@/lib/sampleProperties';

function parseOptionalNumber(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.replace(/[^0-9.-]/g, '');
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalInteger(value: string | undefined) {
  const parsed = parseOptionalNumber(value);
  if (typeof parsed !== 'number') return undefined;
  return Number.isInteger(parsed) ? parsed : Math.round(parsed);
}

export async function GET(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json(samplePropertyList, { status: 200 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get('q') || undefined;

  const results = await prisma.property.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { images: true },
  });

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured. Cannot create listings.' }, { status: 503 });
  }

  const formData = await req.formData();
  const title = formData.get('title')?.toString() || '';
  const description = formData.get('description')?.toString() || undefined;
  const propertyType = formData.get('propertyType')?.toString() || undefined;
  const status = formData.get('status')?.toString() || 'published';
  const currency = formData.get('currency')?.toString() || 'USD';
  const price = formData.get('price')?.toString() || undefined;
  const location = formData.get('location')?.toString() || undefined;
  const address = formData.get('address')?.toString() || undefined;
  const bedrooms = formData.get('bedrooms')?.toString() || undefined;
  const bathrooms = formData.get('bathrooms')?.toString() || undefined;
  const areaSqm = formData.get('areaSqm')?.toString() || undefined;
  const files = formData.getAll('images').filter((item) => item instanceof File) as File[];

  if (!title) {
    return NextResponse.json({ error: 'Property title is required.' }, { status: 400 });
  }

  if (files.length < 1) {
    return NextResponse.json({ error: 'Please upload at least one image for the property.' }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      title,
      description,
      propertyType,
      status,
      price: parseOptionalNumber(price),
      currency,
      address: address ? { text: address } : undefined,
      location: location ? { text: location } : undefined,
      bedrooms: parseOptionalInteger(bedrooms),
      bathrooms: parseOptionalInteger(bathrooms),
      areaSqm: parseOptionalNumber(areaSqm),
    },
  });

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', property.id);
  await fs.mkdir(uploadDir, { recursive: true });

  const imageRecords = await Promise.all(
    files.map(async (file, index) => {
      const extension = path.extname(file.name) || '.jpg';
      const safeName = `image-${index + 1}${extension}`;
      const filePath = path.join(uploadDir, safeName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      return {
        propertyId: property.id,
        url: `/uploads/${property.id}/${safeName}`,
        caption: file.name,
        sortOrder: index,
      };
    })
  );

  await prisma.propertyImage.createMany({ data: imageRecords });

  const result = await prisma.property.findUnique({
    where: { id: property.id },
    include: { images: true },
  });

  return NextResponse.json(result, { status: 201 });
}
