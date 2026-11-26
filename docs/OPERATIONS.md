# Development and operations

## 1. Local development

Requirements: a supported Node.js/npm version compatible with the lockfile and access to a development Neon database and Resend account if testing integrations.

```powershell
npm install
npx prisma generate
npm run dev
```

The Next.js development server normally runs at `http://localhost:3000`. Add required variables to a local `.env` file (ignored by Git). Do not copy production credentials into local or preview environments.

Run schema changes against a disposable/development database only. Use reviewed migrations rather than `db push` against production.

## 2. Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `DATABASE_URL` | Database-backed features | Neon Postgres runtime connection; use the correct pooled connection strategy |
| `DIRECT_URL` | Prisma migrations when configured | Direct Neon connection for migration operations; add Prisma datasource configuration if the project adopts this variable |
| `SESSION_SECRET` | Admin sessions | Random secret of at least 32 characters; server-only and different per environment |
| `RESEND_API_KEY` | Transactional email | Server-only secret |
| `RESEND_FROM_EMAIL` | Transactional email | Sender address must be verified in Resend; defaults to `Jidor Properties <sales@jidorproperties.com>` |
| `CONTACT_RECIPIENT_EMAIL` | Contact/consultation notifications | Jidor team inbox; configure per environment |
| `RESEND_WEBHOOK_SECRET` | Delivery webhooks | Server-only signing secret; webhook verification is a production release gate |
| `NEXT_PUBLIC_APP_URL` | Email links and canonical URLs | Public origin for the specific deployment; ensure preview links do not point to production unintentionally |

Only expose values with the `NEXT_PUBLIC_` prefix when they are genuinely public. Do not put secret keys, connection strings, session signing keys, or webhook secrets in client-exposed variables.

## 3. Neon setup and schema changes

1. Create separate Neon branches/databases for development, preview, and production.
2. Obtain the runtime connection string and configure deployment secrets.
3. Generate Prisma Client after dependencies/schema are installed or changed:

   ```powershell
   npx prisma generate
   ```

   Generate a session secret for local development and each deployment environment:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

   Store the output as `SESSION_SECRET` in the environment's secret manager. Do not commit it. Existing staff accounts must be explicitly assigned the `admin` role through an approved database operation; public registration creates ordinary user accounts only.

4. Create and review a migration against development:

   ```powershell
   npx prisma migrate dev --name descriptive_change
   ```

5. Commit the migration with the schema/code change. Apply to production with:

   ```powershell
   npx prisma migrate deploy
   ```

   The property-type image gallery adds the `PropertyTypeImage` table. Apply its migration before enabling image management.

6. Verify migration status and a read/write health check after deployment.

Coordinate runtime pooling and direct migration connection configuration with the current Prisma/Neon setup. Never run destructive migrations against production without an approved backup/restore and rollback plan.

## 4. Resend setup

1. Configure and verify a sender domain in Resend.
2. Create an API key with the minimum required permission and store it as `RESEND_API_KEY`.
3. Set `CONTACT_RECIPIENT_EMAIL` and `NEXT_PUBLIC_APP_URL` per environment.
4. Configure the Resend webhook endpoint at `/api/webhooks/resend` for relevant delivery events.
5. Store the webhook signing secret as `RESEND_WEBHOOK_SECRET`.
6. Confirm signature verification against Resend's current documentation before enabling production events.
7. Test a successful send, provider rejection, delayed/bounced delivery, duplicate webhook, and retry behavior using nonproduction addresses.

Do not treat API acceptance as final delivery. Delivery outcomes should be visible in authorized staff tooling and monitoring.

## 5. Deployment and release sequence

1. Review product/data/API contract changes and migration impact.
2. Run lint, type-check/build, unit/integration tests, and migration tests.
3. Confirm required environment variables are present without printing secret values.
4. Deploy backward-compatible schema changes first when needed.
5. Deploy application code and run smoke tests for public pages, published/draft visibility, lead submission, and admin access.
6. Confirm Resend delivery and webhook state updates in the target environment.
7. Monitor application errors, database connectivity, lead volume, and email failures.

Production promotion must not use a preview database or recipient configuration. Do not launch admin or mutation endpoints until authorization release gates pass.

## 6. Observability and incident response

Monitor:

- Application error rate and route latency.
- Neon connection failures, query latency, and migration status.
- Lead creation success/failure and rate limiting.
- Resend send failures, bounce/complaint events, retry backlog, and webhook failures.
- Authentication failures and unexpected admin mutations.

On an incident:

1. Determine whether public browsing, lead persistence, email delivery, or staff access is affected.
2. Preserve lead intake whenever safely possible; communicate degraded email notification behavior to staff.
3. Use correlation IDs and sanitized logs; do not paste personal data or secrets into incident logs.
4. Retry provider delivery only through an idempotent mechanism.
5. Record cause, affected time range, lead reconciliation performed, and follow-up action.

## 7. Backup, recovery, and privacy operations

Before production data is collected, document Neon backup/restore configuration, recovery-point objective, recovery-time objective, restore owner, and a tested restore procedure. Define who handles data-access/deletion requests and how leads are exported or removed according to approved retention policy.

Never use production personal data in local development fixtures. Restrict database credentials and staff access to the minimum needed.
