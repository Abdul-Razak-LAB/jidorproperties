# Quality, verification, and release

## 1. Verification strategy

Test behavior at the user-visible boundary as well as schema helpers. Cover:

- Unit tests for validation, mapping, price/unit formatting, and status transitions.
- Database integration tests against an isolated Neon test database or equivalent PostgreSQL environment.
- Route tests for authorization, validation, persistence, provider failures, and webhook replay.
- Browser tests for discovery, filters, property detail, forms, and staff workflows.
- Accessibility checks with automated tooling plus keyboard and screen-reader review.
- Deployment smoke tests for production environment configuration and protected routes.

Never run test submissions against the production recipient or production lead database.

## 2. Acceptance scenarios

### Property discovery

- Published listing appears in list/search and detail pages.
- Draft and archived listing do not appear in public list, search, sitemap, or detail page.
- Filters combine correctly, invalid ranges fail safely, and no-results state offers a clear next action.
- Price, currency, unit, image order, alt text, and availability are consistent between list and detail pages.
- Database failure produces an explicit service error and never presents sample data as live inventory.

### Lead capture and email

- Valid contact and consultation submissions create one durable, correctly attributed lead.
- Invalid/malformed input and hidden property attribution do not create a lead.
- Automated and repeated submissions are controlled without blocking ordinary visitors.
- If Resend is unavailable after persistence, lead remains available to staff and notification can be retried.
- Successful, bounced/failed, and duplicate webhook deliveries update delivery state safely and idempotently.
- Public response does not disclose whether an email address belongs to an account.

### Staff security and workflow

- Unauthenticated users cannot read admin pages or invoke admin mutations.
- Authenticated users without the required role receive forbidden responses.
- Staff sees only permitted leads; role/assignee values cannot be spoofed through request data.
- Valid status and assignment changes are persisted and audited; invalid transitions are rejected.
- Password reset and email verification tokens expire, are single-use, and do not establish unintended access.

## 3. Accessibility

Target WCAG 2.2 AA:

- All actions are keyboard-operable with visible focus and logical focus order.
- Forms have programmatic labels, clear required/optional state, and errors associated with the relevant field.
- Success/failure status is announced to assistive technology without relying on color alone.
- Headings, landmarks, links, and buttons use semantic elements.
- Text/background contrast and target size are adequate; zoom and narrow viewport layouts remain usable.
- Images have appropriate alt text; decorative images do not add redundant announcements.

## 4. Performance and SEO

Use real-user Core Web Vitals where available; target the 75th percentile:

| Metric | Target |
|---|---:|
| LCP | ≤ 2.5 seconds |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |

Also verify responsive image sizing, eager loading only for likely LCP imagery, reserved image dimensions, self-hosted/optimized fonts, limited client JavaScript, and no avoidable serial data-fetching waterfalls.

SEO checks:

- Unique title/description and canonical URL on public property pages.
- Sitemap includes only indexable public content.
- Draft/unavailable behavior follows the approved indexing policy.
- Social previews and structured data accurately match visible content.
- Useful not-found behavior for invalid or unpublished property slugs.

## 5. Security and privacy release checks

- All server routes validate input and enforce authentication/authorization where required.
- No secrets are committed or exposed to client bundles.
- Resend webhook verification follows provider documentation and unsigned production requests fail closed.
- Upload validation and durable storage are in place.
- Password/session/token lifecycle is reviewed and tested.
- Rate limiting, abuse handling, and safe error responses are verified.
- Logs exclude tokens, passwords, secrets, and unnecessary message/lead data.
- Privacy, terms, consent, retention, and data-subject request handling are approved for the operating jurisdiction.

## 6. Release checklist

- [ ] Product decisions in the PRD are confirmed or explicitly deferred.
- [ ] Public property visibility and listing completeness tests pass.
- [ ] Admin authentication and authorization tests pass for every page and mutation.
- [ ] Leads persist independently of email and are visible to authorized staff.
- [ ] Resend delivery, webhook verification, retry, and idempotency tests pass.
- [ ] Neon migrations have been reviewed and tested against the release database branch.
- [ ] Durable image storage and upload controls are active.
- [ ] Mobile, keyboard, accessibility, and Core Web Vitals checks have been completed.
- [ ] Privacy/legal copy, currency, units, contact details, and property claims are approved.
- [ ] Monitoring, backup/restore, support owner, and incident procedure are ready.
- [ ] Production and preview credentials, recipients, and databases are isolated.
