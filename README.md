# Homes Hub

Initial project scaffold for the Homes Hub real estate marketplace.

## Setup

```bash
npm install
npm run dev
```

## Project Structure

- `src/app` - Next.js App Router pages and layout
- `src/styles` - Global Tailwind CSS styles
- `docs` - Product documentation and PRD

## Prisma / Neon setup

1. Add your Neon `DATABASE_URL` to a `.env` file.
2. Install Prisma and generate the client:

```bash
npm install
npx prisma generate
```

3. Run migrations during development:

```bash
npx prisma migrate dev --name init
```

## Resend
- Add `RESEND_API_KEY` to `.env` to enable transactional emails.
- Optionally add `CONTACT_RECIPIENT_EMAIL` to receive contact and consultation form submissions.
- Webhook handler is available at `/api/webhooks/resend`.

## Notes

- Uses `Next.js`, `TypeScript`, `Tailwind CSS`, `Neon`-ready database planning, and `Resend` for email.
- Update `.env` with `NEON_DATABASE_URL`, `RESEND_API_KEY`, and other runtime secrets.
- Contact and consultation submissions are stored in Neon through Prisma `EmailQueue` and can be viewed at `/admin/leads`.
