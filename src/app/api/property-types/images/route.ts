import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { ensurePropertyTypeImageTable, hasDatabase, prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/adminSession';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/avif': '.avif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

type PropertyTypeImageRecord = {
  id: string;
  propertyType: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  createdAt: Date;
};

export async function GET() {
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  try {
    await ensurePropertyTypeImageTable();
    const images = await prisma.$queryRaw<PropertyTypeImageRecord[]>`
      SELECT "id", "propertyType", "url", "caption", "sortOrder", "createdAt"
      FROM "PropertyTypeImage"
      ORDER BY "propertyType" ASC, "sortOrder" ASC, "createdAt" ASC
    `;
    return NextResponse.json(images);
  } catch (error) {
    console.error('Failed to load property type images', error);
    return NextResponse.json({ error: 'Unable to load property type images.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  const formData = await req.formData();
  const propertyType = formData.get('propertyType')?.toString().trim() || '';
  const file = formData.get('image');

  if (!propertyType || propertyType.length > 100) {
    return NextResponse.json({ error: 'Choose a valid property type.' }, { status: 400 });
  }
  if (!(file instanceof File) || !IMAGE_EXTENSIONS[file.type]) {
    return NextResponse.json({ error: 'Upload a JPEG, PNG, WebP, or AVIF image.' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: 'Images must be smaller than 8 MB.' }, { status: 400 });
  }

  const imageId = randomUUID();
  const uploadDirectory = path.join(process.cwd(), 'public', 'uploads', 'property-types');
  const fileName = `${imageId}${IMAGE_EXTENSIONS[file.type]}`;
  const filePath = path.join(uploadDirectory, fileName);
  const url = `/uploads/property-types/${fileName}`;

  try {
    await ensurePropertyTypeImageTable();
    await fs.mkdir(uploadDirectory, { recursive: true });
    await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()), { flag: 'wx' });
    const [{ sortOrder }] = await prisma.$queryRaw<{ sortOrder: number }[]>`
      SELECT COALESCE(MAX("sortOrder") + 1, 0)::int AS "sortOrder"
      FROM "PropertyTypeImage"
      WHERE "propertyType" = ${propertyType}
    `;
    const [image] = await prisma.$queryRaw<PropertyTypeImageRecord[]>`
      INSERT INTO "PropertyTypeImage" ("id", "propertyType", "url", "caption", "sortOrder")
      VALUES (${imageId}, ${propertyType}, ${url}, ${file.name.slice(0, 200)}, ${sortOrder})
      RETURNING "id", "propertyType", "url", "caption", "sortOrder", "createdAt"
    `;
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    await fs.rm(filePath, { force: true }).catch(() => undefined);
    console.error('Failed to save property type image', error);
    return NextResponse.json({ error: 'Unable to save property type image.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Admin authentication required.' }, { status: 401 });
  }
  if (!hasDatabase || !prisma) {
    return NextResponse.json({ error: 'Database not configured.' }, { status: 503 });
  }

  let imageId = '';
  try {
    const body = await req.json();
    imageId = typeof body?.id === 'string' ? body.id : '';
  } catch {
    return NextResponse.json({ error: 'A valid image ID is required.' }, { status: 400 });
  }
  if (!imageId) {
    return NextResponse.json({ error: 'A valid image ID is required.' }, { status: 400 });
  }

  try {
    await ensurePropertyTypeImageTable();
    const [image] = await prisma.$queryRaw<{ url: string }[]>`
      SELECT "url" FROM "PropertyTypeImage" WHERE "id" = ${imageId} LIMIT 1
    `;
    if (!image) return NextResponse.json({ error: 'Image not found.' }, { status: 404 });

    await prisma.$executeRaw`DELETE FROM "PropertyTypeImage" WHERE "id" = ${imageId}`;
    const uploadRoot = path.resolve(process.cwd(), 'public', 'uploads', 'property-types');
    const imagePath = path.resolve(process.cwd(), 'public', image.url.replace(/^\/+/, ''));
    if (imagePath.startsWith(`${uploadRoot}${path.sep}`)) {
      await fs.rm(imagePath, { force: true });
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Failed to delete property type image', error);
    return NextResponse.json({ error: 'Unable to delete property type image.' }, { status: 500 });
  }
}
