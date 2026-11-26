# Data model and persistence

**Status:** Current schema inventory plus required domain contract. This document does not itself change the Prisma schema.

## 1. Persistence rules

- Neon Postgres is the source of truth for listings, leads, staff identity/permissions, and delivery state.
- Prisma schema changes require a reviewed migration committed with the application change.
- Production must not silently switch to sample data when Neon is missing or unavailable.
- Store values that need filtering, sorting, uniqueness, or lifecycle transitions in typed columns or relations; reserve JSON for variable details.
- Use UTC timestamps for storage and render them in the user's configured locale/time zone.
- Define deletion, retention, export, backup, and restoration policy before storing production personal data.

## 2. Current Prisma schema

| Model | Current role | Gaps to address |
|---|---|---|
| `User` | Email, password hash, role string, profile, verification timestamp | Role is unconstrained text; staff/customer distinctions and session model are not defined |
| `Property` | Listing fields, optional agent, JSON address/location/features, status string, price, publication timestamp | Status/type are unconstrained strings; slug, availability, currency rules, publication validation, and explicit location fields need definition |
| `PropertyImage` | Image URL, caption, ordering | No explicit alt text/storage key or image ownership lifecycle |
| `Message` | Generic sender/recipient and optional property message | Not currently the lead system of record; sender/recipient relations and use are unclear |
| `EmailQueue` | Recipient, template, JSON variables, status, Resend ID | Holds contact/consultation payloads rather than a durable domain lead; lacks attempts, errors, update times, and event history |
| `VerificationToken` | User token, type, expiry | Token generation/storage handling needs security review; add appropriate single-use and expiry constraints |

## 3. Required domain model

### Property

Required launch concepts:

- Stable ID and unique, human-readable slug.
- Title, short summary, full description, property/development type.
- Lifecycle state: at minimum draft, published, and archived.
- Availability state chosen by product (for example coming soon, available, reserved, sold, completed); keep lifecycle and availability separate.
- Currency and non-negative monetary price, or explicit contact-for-price value.
- Structured location fields sufficient for filtering and a separate display address if needed.
- Optional bedrooms, bathrooms, floor/land area with explicit unit, and amenities.
- Created/updated/published timestamps and responsible editor.

Public queries must enforce publication state and only return fields approved for public display. Do not rely on frontend filtering to hide draft records.

### Property media

- Relation to a property with a stable storage key/URL.
- Alt text for meaningful images; decorative images may use empty alt text in the rendered page.
- Sort order, optional caption, upload metadata, and created timestamp.
- Validate file size/type and ensure media can be safely removed or replaced.

### Lead

Persist the inquiry independently from email delivery. Required concepts:

- Lead ID and type (contact or consultation).
- Name, email, optional phone, message/notes.
- Optional property relation and submitted URL/source.
- Preferred date/time for consultation, stored with a clear timezone interpretation.
- Consent record/version where legally required.
- Lifecycle status, owner/assignee, created/updated timestamps, and follow-up history.
- Abuse/idempotency metadata with a retention policy.

Avoid putting the only copy of a lead in an email payload, provider logs, or generic JSON queue.

### Email delivery

Track notification attempts separately:

- Lead/reference, template key/version, recipient, provider name.
- State such as queued, sent, delivered, bounced, failed, or suppressed.
- Resend message/event identifiers, attempt count, last error category, retry time, and timestamps.
- Idempotency key/event identity to prevent duplicate webhook processing.

Never store API keys or full secrets in delivery rows. Minimize retained message content and provider responses.

### Staff and audit records

- Distinguish staff from public users and constrain role values.
- Model team/assignment relationships if staff should see only assigned leads.
- Audit actor, action, entity, timestamp, and the minimum useful change metadata for sensitive operations.
- Never audit passwords, raw session tokens, reset/verification tokens, or secret values.

## 4. Data integrity, indexing, and query patterns

Proposed constraints and indexes (confirm after reviewing the real query workload):

- Unique property slug.
- Index property publication state + publication time; availability and type/location filters as needed.
- Index lead creation time, status, type, and assignee; index normalized email if staff search needs it.
- Foreign keys for property media, leads, assignments, delivery attempts, and audit relations.
- Check constraints for non-negative prices/areas and valid lifecycle values where practical.
- Use case-insensitive email uniqueness consistently at registration and login.
- Use database transactions for publishing plus related content updates and lead status/assignment transitions.

Full-text search and geospatial filtering are later technical decisions; begin with bounded, indexed query patterns and measure before adding specialized extensions.

## 5. Migration and seed policy

1. Update `prisma/schema.prisma` and generate a migration locally.
2. Inspect generated SQL for data-loss, lock, and default-value risks.
3. Test migration against an isolated development/preview Neon database.
4. Commit schema and migration together.
5. Apply production migrations in the release process using the direct migration connection.
6. Use explicit seed scripts only for development/demo data. Never seed production sample listings implicitly.
7. Document any backfill, rollback limitation, or required maintenance window.

## 6. Data lifecycle open decisions

- Lead and account retention period and deletion/export request workflow.
- Whether inactive/sold property pages remain public for SEO/history or become noindex/redirected.
- Whether inquiries may be assigned to teams or individual agents.
- How prices, currency, area units, and time zones are represented across service regions.
- Whether attachments/documents are supported and, if so, their access and retention controls.
