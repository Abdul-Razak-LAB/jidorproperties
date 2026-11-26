import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const isValidDatabaseUrl = (url?: string) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    !lower.includes('<username>') &&
    !lower.includes('<password>') &&
    !lower.includes('<host>') &&
    !lower.includes('<database>') &&
    url.startsWith('postgresql://')
  );
};

export const hasDatabase = isValidDatabaseUrl(process.env.DATABASE_URL);

export const prisma: PrismaClient | undefined = hasDatabase
  ? global.prisma ?? new PrismaClient()
  : undefined;

if (hasDatabase && process.env.NODE_ENV !== 'production') global.prisma = prisma;

export async function ensurePropertyTypeImageTable() {
  if (!hasDatabase || !prisma) return false;

  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "PropertyTypeImage" (
      "id" TEXT NOT NULL,
      "propertyType" TEXT NOT NULL,
      "url" TEXT NOT NULL,
      "caption" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "PropertyTypeImage_pkey" PRIMARY KEY ("id")
    )
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "PropertyTypeImage_propertyType_sortOrder_idx"
    ON "PropertyTypeImage"("propertyType", "sortOrder")
  `;

  return true;
}

export default prisma;
