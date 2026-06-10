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

export default prisma;
