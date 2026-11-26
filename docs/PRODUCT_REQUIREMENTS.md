# Jidor Properties — Product Requirements

**Document status:** Product definition
**Product:** Jidor Properties
**Platform:** Responsive real-estate developer website and lead-management dashboard
**Primary market assumption:** Ghana; confirm service areas, currency, and legal requirements before launch
**Technology direction:** Next.js, TypeScript, Neon Postgres, Prisma, and Resend

## 1. Product summary

Jidor Properties helps prospective buyers and investors discover the developer's properties, understand each development, and take a clear next step: request information, book a consultation, or contact the team. Staff need a straightforward way to maintain property listings and follow up on incoming leads.

The website should communicate trust and local expertise, make current inventory easy to explore on mobile, and turn qualified interest into an actionable lead. It is a developer-led sales and marketing product, not a public marketplace where unrelated users publish listings.

## 2. Goals and success measures

### Goals

- Present Jidor Properties, its developments, locations, and services with a consistent, credible brand.
- Help visitors find relevant properties and understand availability, pricing, features, and location.
- Convert property interest into contact requests or consultation bookings.
- Give authorized staff a reliable view of listings and incoming leads.
- Keep property and lead data in Neon Postgres and send transactional email through Resend.
- Provide a fast, accessible, search-engine-friendly experience on mobile and desktop.

### Success measures

Establish baseline analytics before setting numeric targets. Track:

- Property-list and property-detail views.
- Search usage and property-detail click-through rate.
- Contact and consultation form completion rate.
- Lead response time and lead-to-consultation rate.
- Property inventory freshness and percentage of listings with complete information.
- Core Web Vitals: LCP ≤ 2.5 seconds, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile.

## 3. Users and permissions

| User | Needs | Permissions |
|---|---|---|
| Prospective buyer or investor | Browse developments, compare options, ask questions, arrange a consultation | Read public listings; submit own requests |
| Property sales representative | Receive and follow up on inquiries; share accurate listing information | Access assigned or team leads and listing details, according to role |
| Content/editorial staff | Keep descriptions, images, prices, and availability current | Create and edit listings; publish or unpublish |
| Administrator | Manage staff access, listings, lead operations, and site configuration | Full administrative access with auditability |

Public visitors must not be able to access the administration area or other users' lead information. Staff access must be authenticated and role-checked on the server for every protected page and mutation.

## 4. Scope

### Launch scope (P0)

1. **Brand and company pages**
   - Responsive home page introducing Jidor Properties, its services, and active developments.
   - About, contact, and company-information content with clear contact details.
   - Prominent calls to action leading to property details, contact, and consultation flows.

2. **Property discovery**
   - Published property/development listings with image, title, type, location, price or “contact for price,” and availability.
   - Property detail page with description, gallery, location, bedrooms/bathrooms/area where applicable, amenities, and an inquiry call to action.
   - Search by text and filters for location, type, price range, and availability.
   - Empty, loading, and error states that explain what the visitor can do next.
   - Unpublished or draft listings must never appear in public results.

3. **Lead capture**
   - Contact form collecting name, email, message, and optional phone/property of interest.
   - Consultation request form collecting name, email, preferred date/time, and optional notes/property of interest.
   - Field validation, clear success and retry messaging, spam controls, and duplicate-submission protection.
   - Persist each accepted lead in Neon before returning success. Send a notification to the configured Jidor inbox through Resend; where configured, send the visitor an acknowledgement.

4. **Staff administration**
   - Secure staff sign-in and role-based access.
   - Create, edit, publish, unpublish, and archive property listings.
   - Manage listing images and ordering.
   - Review, search, and filter leads; view contact details, inquiry context, timestamps, and delivery status.
   - Record lead status and follow-up ownership so that inquiries can be worked to completion.
   - Display useful inventory and lead summaries without exposing data to public users.

5. **Operations and trust**
   - Privacy notice, terms, and consent language appropriate to the final market and applicable law.
   - Useful not-found and service-error pages.
   - Search metadata, canonical URLs, sitemap, robots rules, and social-sharing previews for public content.
   - Operational logging that does not expose credentials or unnecessary personal data.

### Later scope (P1/P2)

- Saved properties and user accounts, only if customer research shows a need.
- Agent/team profiles and lead assignment workflows.
- Map-based discovery, mortgage/affordability tools, multilingual content, and newsletter signup.
- CRM integration, analytics dashboards, and automated lead-routing rules.
- Property availability reminders and scheduled email campaigns.

These features are not required for initial launch and should not delay reliable listing and lead workflows.

## 5. Functional requirements and acceptance criteria

### Property content and discovery

- **FR-01:** A visitor can browse only published, active listings.
- **FR-02:** A visitor can open a stable, shareable detail URL for each listing.
- **FR-03:** Search and filters can be combined; changing filters preserves a usable URL where practical.
- **FR-04:** Prices include an explicit currency and are never presented as a guaranteed offer. Listings with no public price show an approved alternative label.
- **FR-05:** Each image has descriptive alternative text, a stable display order, and responsive dimensions.
- **FR-06:** Staff can save a draft and preview it before publication. Required launch fields and publication rules are validated on the server.
- **FR-07:** Property status and availability are explicit, managed values rather than arbitrary free text.

**Acceptance:** A draft is not discoverable through public listing, search, or detail routes. A published listing can be found with supported filters and displays consistent data on list and detail pages. An unavailable listing is visibly marked or removed according to the agreed business rule.

### Contact and consultation requests

- **FR-08:** Forms validate required fields and reject malformed email addresses and invalid dates/times.
- **FR-09:** The visitor receives success only after the lead has been durably stored. Email delivery failure is visible to staff and does not silently discard the lead.
- **FR-10:** Lead records distinguish contact and consultation types and retain property attribution, consent, submission time, and follow-up state where applicable.
- **FR-11:** Form submissions are protected against automated abuse and repeated accidental submissions.
- **FR-12:** Email templates are branded, accessible, and provide the staff with enough information to follow up.

**Acceptance:** With Neon available, a valid submission creates one lead and triggers the configured Resend flow. If Resend is unavailable after persistence, the lead remains visible with a failed/pending notification state and can be retried. Invalid requests receive an actionable validation response and create no lead.

### Staff workflows

- **FR-13:** Only authenticated, authorized staff can read or mutate admin data.
- **FR-14:** Staff can find a lead by contact details, type, date, status, or associated property.
- **FR-15:** Staff can update follow-up status and owner; changes are attributable and timestamped.
- **FR-16:** Listing creation/editing validates values, image types, image sizes, and ownership/permissions.
- **FR-17:** Staff-facing pages provide database-unavailable and empty states without presenting mock data as production records.

**Acceptance:** An unauthenticated request to any protected admin page or API is denied server-side. A staff member without the relevant role cannot perform the operation. Updating a lead or listing is reflected in the next read and is recorded for operational review.

## 6. Key user journeys

### Discover and inquire

Home page → browse or search properties → apply filters → open a property → review details → submit an inquiry → see confirmation → Jidor team receives and follows up.

### Request a consultation

Home page or property detail → open consultation form → select preferred date/time and include context → submit → see confirmation → team receives the request and contacts the visitor to confirm an appointment.

### Publish a development

Staff sign in → create a draft → enter validated details and upload images → preview → publish → verify the public listing and detail page.

### Work a lead

Staff sign in → open leads inbox → filter or search → review request and property context → assign owner/update status → contact the prospect → record the outcome.

## 7. Data and integration requirements

### Neon Postgres and Prisma

- Use Neon Postgres as the production system of record, accessed through Prisma.
- Use `DATABASE_URL` for the runtime connection; keep pooled/runtime and direct/migration connection configuration aligned with Neon deployment guidance.
- Apply schema changes through versioned Prisma migrations; do not rely on manual production schema edits.
- Keep production, preview, and local databases isolated.
- Store normalized, queryable fields for property type, publication/availability status, currency, price, location, dimensions, and lead lifecycle. Use JSON only for genuinely variable structured data.
- Add indexes for common filters, listing status/publication date, lead creation/status/type, and case-insensitive search as justified by query patterns.
- Define retention, deletion, backup, restore, and export policies for leads and account data before launch.
- Do not use sample property data as a fallback for production reads.

### Suggested domain entities

| Entity | Key information |
|---|---|
| Property | Title, slug, description, type, publication state, availability, currency/price, location, features, publication timestamps |
| PropertyImage | Property, URL/storage key, alt text/caption, ordering |
| Lead | Type, contact details, message/appointment preferences, property attribution, consent, status, owner, timestamps |
| StaffUser | Email, password/auth provider reference, role, verification and audit timestamps |
| EmailDelivery | Lead/reference, template, recipient, provider message ID, status, attempt count, error category, timestamps |
| AuditEvent | Actor, action, entity, timestamp, and appropriate change metadata |

The current Prisma schema is a starting point, not the complete launch data model. In particular, lead data currently resides in a generic `EmailQueue` JSON payload; distinguish durable lead records from email delivery attempts before relying on it for CRM workflows.

### Resend

- Use Resend for server-side transactional delivery only; never expose its API key to the browser.
- Configure `RESEND_API_KEY`, a verified sender/domain, and a configurable recipient address (for example `CONTACT_RECIPIENT_EMAIL`).
- Store delivery state and provider message IDs, and process delivery webhooks only after verifying the provider's signature according to Resend's current webhook specification.
- Make delivery retries idempotent and observable. Do not treat an email-send attempt as proof that a lead was stored or successfully delivered.
- Provide branded templates for staff notifications, visitor acknowledgements, account verification, and password reset if account features are enabled.

### Environment configuration

Required in the relevant deployment environments:

- `DATABASE_URL` — Neon Postgres connection string.
- `RESEND_API_KEY` — Resend server API key.
- `CONTACT_RECIPIENT_EMAIL` — inbox for new inquiries.
- `RESEND_WEBHOOK_SECRET` — signing secret for the configured Resend webhook.
- `NEXT_PUBLIC_APP_URL` — canonical deployed application origin for links in email.

Secrets belong in the deployment secret manager or local ignored environment files, never in source control or client-side variables.

## 8. Non-functional requirements

### Performance and reliability

- Meet the Core Web Vitals targets in the success measures on real-user traffic.
- Render public property content server-side where appropriate; keep client-side JavaScript limited to interactive elements.
- Optimize and size property images for their display context; reserve dimensions to avoid layout shift.
- Cache public content only with an explicit revalidation strategy so that price and availability updates are not stale beyond the agreed business window.
- Provide graceful error handling for database and email-provider outages. A lead must not be lost because notification delivery failed.
- Set up uptime, error, and delivery-failure monitoring with actionable alerts and a documented owner.

### Accessibility and responsive design

- Target WCAG 2.2 AA for public and staff flows.
- Support keyboard navigation, visible focus, semantic headings, labels, accessible validation errors, sufficient contrast, and screen-reader status announcements.
- Ensure forms and navigation work at small mobile widths and with touch input.
- Do not communicate status, price, or availability by color alone.

### Security and privacy

- Enforce authentication, authorization, input validation, and rate limits on the server.
- Hash passwords with a current, appropriately configured password-hashing algorithm if password-based accounts remain in scope; use secure session cookies and safe account-recovery flows.
- Protect secrets, validate webhook signatures, and sanitize/escape untrusted content at output boundaries.
- Limit personal-data access to staff who need it; collect only necessary information and define retention/deletion procedures.
- Obtain appropriate consent for communications and analytics, and have privacy and legal requirements reviewed for the operating jurisdiction.
- Record security-relevant administrative actions and avoid logging passwords, tokens, full message contents, or unnecessary personal data.

### SEO and content quality

- Use descriptive page titles, metadata, canonical URLs, and social previews.
- Give every published development a unique title, slug, summary, location, and useful images.
- Use structured data only where the data is accurate and the markup matches the visible page.
- Keep draft, duplicate, and unavailable pages out of search indexes according to the agreed content policy.

## 9. Product and technical constraints

- The existing application uses Next.js App Router, TypeScript, Prisma, and Neon-oriented Postgres configuration.
- Existing routes include the public home page, property detail pages, property-management UI, admin overview/leads surfaces, contact and consultation endpoints, account endpoints, and a Resend webhook.
- Existing implementation is incomplete relative to this document. Current login returns user data without issuing a session, and protected routes must not be considered secure until server-side authorization is implemented and tested.
- Existing contact/consultation submissions notify Resend inline and may store payloads in `EmailQueue`; this is not equivalent to a durable lead-management and background email-delivery system.
- Current image uploads write to the local public directory. Production media storage must use durable object storage or another deployment-compatible service before relying on uploads across deployments.
- Sample listings may support development previews only and must be clearly separated from production data.

## 10. Release gates

Do not launch until:

1. Staff authentication and server-side authorization protect every admin route and mutation.
2. Public reads exclude drafts, and listing publication/availability rules are agreed and tested.
3. Leads persist independently of email delivery and can be reviewed/retried by authorized staff.
4. Resend sender-domain verification, webhook verification, email templates, and alerting are configured.
5. Neon migrations, production environment variables, backup/restore expectations, and separate preview data are verified.
6. Property image storage is durable, validated, and sized appropriately.
7. Contact/consultation flows pass accessibility, mobile, validation, abuse-prevention, and failure-path checks.
8. Privacy, terms, data retention, currency, service areas, contact details, and legal copy are approved by Jidor Properties.

## 11. Decisions to confirm

- Which cities/regions and property types are in the initial service area?
- Which currency or currencies should be supported, and what is the preferred price-display format?
- Does “development website” mean selling Jidor-owned developments only, or should the product also support resale/rental listings?
- Which listing statuses are needed (for example, available, reserved, sold, completed, or coming soon), and which should remain publicly visible?
- Should visitors create accounts, or should launch remain inquiry-first?
- Who receives and owns new leads, what response-time commitment should be shown, and what lead statuses are required?
- Which durable image-storage provider and analytics/CRM tools are approved?
- What consent, retention, privacy, and regulatory requirements apply to Jidor's operating locations?

## 12. Out of scope for initial launch

- Payments, deposits, contracts, conveyancing, and transaction execution.
- Guaranteed investment returns, valuations, financing approvals, or legal advice.
- Public user-submitted listings and marketplace moderation.
- Automated email marketing campaigns without explicit consent and unsubscribe controls.
