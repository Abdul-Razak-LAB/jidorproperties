import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { hasDatabase, prisma } from '@/lib/prisma';
import { samplePropertyList } from '@/lib/sampleProperties';

export async function GET(req: NextRequest) {
  if (!hasDatabase || !prisma) {
    return NextResponse.json(samplePropertyList, { status: 200 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get('q') || undefined;

  const results = await prisma.property.findMany({
    where: q ? { OR: [{ title: { contains: q } }, { description: { contains: q } }] } : {},
    take: 20,
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
  const price = formData.get('price')?.toString() || undefined;
  const location = formData.get('location')?.toString() || undefined;
  const address = formData.get('address')?.toString() || undefined;
  const files = formData.getAll('images').filter((item) => item instanceof File) as File[];

  if (!title) {
    return NextResponse.json({ error: 'Property title is required.' }, { status: 400 });
  }

  if (files.length < 5) {
    return NextResponse.json({ error: 'Please upload at least 5 images for the property.' }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      title,
      description,
      propertyType,
      status: 'published',
      price: price ? parseFloat(price) : undefined,
      currency: 'USD',
      address: address ? { text: address } : undefined,
      location: location ? { text: location } : undefined,
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
