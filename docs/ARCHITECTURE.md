# System architecture

**Status:** Proposed target architecture informed by the current repository. Validate and update alongside implementation.

## 1. Context and boundaries

Jidor Properties is a developer-led property discovery and inquiry website. The Next.js application serves the public site and staff interface. Neon Postgres is the system of record. Prisma is the database access layer. Resend delivers transactional email and emits delivery events through webhooks.

```text
Visitor browser
   | HTTPS: public pages, search, contact/consultation forms
   v
Next.js application (App Router)
   | Prisma, server-only credentials
   v
Neon Postgres --------------------> Resend
   ^                                 | transactional mail
   |                                 v
   +---------- verified webhook --- Next.js webhook route

Staff browser -- authenticated, role-checked requests --> Next.js
```

The application owns business validation and authorization. The browser must never connect directly to Neon or call Resend with a secret key. Resend is a delivery provider, not the source of truth for leads.

## 2. Current repository baseline

- Next.js App Router routes are under `src/app`.
- Prisma is configured for PostgreSQL and reads `DATABASE_URL` in `prisma/schema.prisma`.
- The existing Prisma models include `User`, `Property`, `PropertyImage`, `Message`, `EmailQueue`, and `VerificationToken`.
- Public routes include the home page and `/properties/[id]`.
- Route handlers exist for property reads/creation, contact, consultation, account registration/login/recovery, email verification, and the Resend webhook.
- Contact and consultation handlers currently send email directly and, when the database is enabled, store form fields in `EmailQueue.variables`.
- Property image uploads currently write to the app's local `public/uploads` directory.
- Authentication endpoints exist, but the login handler is a placeholder that returns user data without establishing a session. Do not treat admin pages or APIs as protected until authentication and authorization are implemented and tested.

This baseline is a code inventory, not a claim that the flows are complete, secure, or deployable.

## 3. Target application boundaries

### Public experience

- Server-render public property content when practical for fast first render and indexing.
- Expose only published listings and approved public fields.
- Use URL-addressable search/filter parameters so pages can be shared and revisited.
- Keep interactive client components limited to controls that need browser state.

### Staff experience

- Authenticate staff and check role/permission on each protected server-rendered page and mutation.
- Keep admin data queries server-side.
- Give editors only listing permissions; give sales staff only the lead data their role permits; reserve access administration for administrators.
- Log security-relevant mutations with actor and timestamp.

### Application/data access

- Validate all request bodies, query parameters, and uploaded files at the server boundary.
- Use Prisma transactions for changes that span related records.
- Never return database stack traces, secret values, password hashes, verification tokens, or internal provider details to clients.
- Make public reads, staff reads, and staff mutations distinct operations with explicit authorization.

### Media storage

Replace local-disk uploads with a durable object-storage/CDN solution compatible with the deployment platform. Persist the storage key/URL, caption/alt text, and ordering in Neon. Validate content type, size, and ownership before accepting uploads. Do not rely on a serverless function's local filesystem for persistent media.

### Email and asynchronous work

Persist the lead first. Then create a delivery record/outbox entry tied to that lead. Deliver through Resend and record the provider message ID and state. A delivery failure must not roll back or hide the lead. Retry with bounded backoff and idempotency; process verified Resend webhook events to reconcile provider state.

For initial low-volume operation, synchronous delivery after durable persistence can be acceptable if failures are recorded and retryable. Add a durable worker/queue when delivery volume, latency, or retry requirements justify it.

## 4. Core data flows

### Property publication

1. Authorized editor submits listing fields and image references.
2. Server validates values, role, image constraints, and publication requirements.
3. Server persists listing and ordered images in a transaction where possible.
4. On publish/unpublish, invalidate the relevant property/list caches.
5. Public pages render only approved published/available information.

### Contact or consultation

1. Visitor submits a form with a request identifier/idempotency token where supported.
2. Server validates and rate-limits the request.
3. Server persists a lead with type, property attribution, consent, status, and timestamp.
4. Server creates a delivery record and sends the staff notification via Resend.
5. Server returns a success response only after durable lead creation; email delivery state is reported separately.
6. Verified Resend events update delivery state. Staff can inspect and retry failures.

### Staff follow-up

1. Staff authenticates and receives a server-managed session.
2. Server checks role and, where applicable, lead ownership/team membership.
3. Staff views only authorized leads and changes status/assignment.
4. Server validates the transition and records an audit event.

## 5. Runtime and deployment principles

- Use the Node.js runtime for Prisma and provider integrations unless a route has been deliberately designed for another runtime.
- Keep production, preview, and local Neon databases separate.
- Use connection pooling for application traffic where appropriate; use the direct connection configuration required by Prisma migrations.
- Apply schema changes using reviewed, versioned migrations. Deploy compatible schema changes before code that depends on them.
- Keep application credentials server-only and scope provider/database permissions to the minimum needed.
- Configure health/error monitoring for the application, Neon connectivity, and Resend delivery.

## 6. Architecture decisions to record

Before implementation is called production-ready, record decisions for:

- Staff identity/session approach and role model.
- Whether public accounts are needed at launch.
- Durable image provider and image-processing policy.
- Lead ownership, workflow statuses, retention, and audit requirements.
- Whether email delivery uses a database outbox plus scheduled retry, a queue, or another worker.
- Neon pooling/migration connection setup for each deployment environment.
- Cache invalidation behavior and maximum acceptable freshness delay for price/availability.
