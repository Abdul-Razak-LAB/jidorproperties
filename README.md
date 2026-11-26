# Jidor Properties

Real-estate developer website and lead-management application for Jidor Properties.

## Setup

```bash
npm install
npx prisma generate
npm run dev
```

For environment variables, Neon database setup, Resend configuration, and deployment guidance, see [Operations and setup](./docs/OPERATIONS.md).

## Project Structure

- `src/app` - Next.js App Router pages and layout
- `src/styles` - Global Tailwind CSS styles
- `prisma` - Prisma schema for PostgreSQL/Neon
- `docs` - Product, architecture, API, data, operations, staff, and release documentation

Start with the [documentation index](./docs/README.md) or go directly to the [product requirements](./docs/PRODUCT_REQUIREMENTS.md).

## Database migrations

For local development, configure `DATABASE_URL` in an ignored `.env` file, then apply migrations to a development database:

```bash
npx prisma migrate dev --name descriptive_change
```

Production deployments should apply reviewed migrations with:

```bash
npx prisma migrate deploy
```

## Product and readiness

The product requirements and supporting documents distinguish current scaffold behavior from required launch behavior. Do not assume the admin area is protected or that current email queue records constitute durable lead management; see [release gates](./docs/PRODUCT_REQUIREMENTS.md#10-release-gates).
