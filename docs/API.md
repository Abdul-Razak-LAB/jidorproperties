# API contracts

**Status:** Route inventory reflects the current repository. Target requirements below are contracts to implement and test; they are not assurances that current handlers already meet them.

## 1. General conventions

- JSON request/response bodies unless a route explicitly handles `multipart/form-data`.
- Validate input on the server. Reject unknown or malformed values where they could affect persistence or authorization.
- Use consistent errors: `{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }`.
- Do not return secrets, password hashes, tokens, database/provider errors, or arbitrary stack traces.
- Use HTTP status codes consistently: 200/201 success, 400 invalid input, 401 unauthenticated, 403 forbidden, 404 missing resource, 409 conflict, 429 rate limited, and 5xx service failures.
- Public endpoints require abuse controls. Every staff endpoint requires server-side authentication and role checks.
- Define idempotency behavior for lead submissions, email webhooks, and retryable mutations.

## 2. Existing route inventory

| Method and path | Current purpose | Readiness note |
|---|---|---|
| `GET /api/properties` | Lists/searches properties | Repository handler returns sample records if database is absent; public visibility filtering and production error behavior must be confirmed |
| `POST /api/properties` | Creates listing and accepts image files | Requires server-side staff authorization, validation, durable image storage, and consistent cleanup/transaction behavior |
| `POST /api/contact` | Accepts contact form and sends notification | Currently stores payload in `EmailQueue` when configured and sends Resend inline; not yet a complete lead/outbox workflow |
| `POST /api/consultation` | Accepts consultation request and sends notification | Same lead durability and notification concerns as contact route |
| `POST /api/auth/register` | Creates account and attempts verification email | Public account scope is undecided; email verification and abuse controls require completion |
| `POST /api/auth/login` | Checks password | Current handler returns user ID/email without issuing a session; must not be used as staff authorization |
| `GET /api/auth/verify-email` | Verifies email token | Must be reviewed for token handling, expiry, one-time use, and user-facing response |
| `POST /api/auth/forgot-password` | Starts password reset | Must retain generic response behavior and add rate limiting, secure token handling, and delivery state |
| `POST /api/auth/reset-password` | Resets password using token | Must validate password policy, token single use/expiry, and session invalidation |
| `POST /api/webhooks/resend` | Receives Resend events | Current signature scheme/header parsing must be checked against Resend's official signed-webhook format before production; unsigned webhook acceptance must be disabled |

## 3. Target public contracts

### List and search properties

`GET /api/properties?q=&type=&location=&minPrice=&maxPrice=&availability=&page=&pageSize=`

- Return only published records, with public-safe fields.
- Bound `pageSize` and validate numeric ranges/currency semantics.
- Return stable pagination metadata, e.g. `{ "items": [], "page": 1, "pageSize": 20, "total": 0 }`.
- Search/filter combinations must have defined matching and sorting behavior.
- If Neon is unavailable, return an explicit service error rather than sample data in production.

### Property detail

Prefer a public page route for server-rendered detail content; if an API endpoint is needed, use `GET /api/properties/{slug}`.

- Return 404 for nonexistent, draft, or otherwise nonpublic records.
- Include ordered images and display units, currency, availability, and location consistently.
- Never expose staff notes, internal IDs that are not required, private contact data, or draft metadata.

### Contact lead

`POST /api/contact`

Suggested input:

```json
{
  "name": "Visitor name",
  "email": "visitor@example.com",
  "phone": "+233...",
  "message": "I'd like more information.",
  "propertyId": "optional-property-id",
  "consent": true
}
```

- Validate length, email, consent requirements, and property visibility.
- Persist a lead before responding success.
- Return `201 { "id": "...", "status": "received" }` after durable persistence.
- If email notification fails after persistence, still retain the lead, create a failed/retryable delivery state, and return a success that does not falsely promise email delivery.
- Return validation/rate-limit/service errors in the common format.

### Consultation lead

`POST /api/consultation`

Suggested fields are the contact fields plus `preferredDate`, `preferredTime`, and an explicit timezone or agreed business timezone. Validate date/time and property attribution. The response and persistence guarantees match contact leads. The team must confirm the appointment; submission is a request, not a confirmed booking.

## 4. Target staff contracts

Protect these operations behind authenticated staff sessions and permission checks:

- Create/edit/publish/archive property.
- Upload, reorder, and remove property media.
- List/filter/view leads.
- Update lead status, assignment, and follow-up notes.
- Retry a failed notification.
- Manage staff roles and access (administrator only).

Use explicit request schemas and allowed status transitions. Do not trust a submitted `role`, `ownerId`, `status`, or `publishedAt` without authorization and validation. Ensure list endpoints paginate and enforce record-level access.

## 5. Resend webhook contract

`POST /api/webhooks/resend`

- Verify requests using Resend's documented webhook signature verification, including required headers, timestamp/replay protections, and raw request body.
- Reject requests when verification configuration is missing in production.
- Validate event shape and recognized event identifiers.
- Persist event IDs for idempotent processing; repeated delivery must not duplicate state transitions.
- Update only the matching email delivery record; do not treat webhook payloads as lead submissions.
- Return a non-success response for invalid signatures or malformed requests; log a correlation ID and safe error category only.

## 6. API contract completion checklist

- Request and response schemas are versioned/tested.
- Validation, auth, role checks, rate limits, and error mapping are covered by automated tests.
- Public reads exclude unpublished data at the database query boundary.
- Lead persistence is independent from Resend delivery.
- Webhook signature verification matches provider documentation and replay/idempotency behavior is tested.
- API documentation is updated whenever route behavior changes.
