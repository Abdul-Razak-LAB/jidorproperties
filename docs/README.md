# Jidor Properties documentation

This documentation set defines the product and describes the implementation and operating practices needed to deliver it. It is written for product owners, designers, engineers, QA, and operations.

## Start here

| Document | Audience | Purpose |
|---|---|---|
| [Product requirements](./PRODUCT_REQUIREMENTS.md) | Everyone | Product goals, scope, user journeys, acceptance criteria, release gates, and decisions to confirm |
| [System architecture](./ARCHITECTURE.md) | Engineering, operations | Current application shape, target boundaries, integrations, and data flows |
| [Data model](./DATA_MODEL.md) | Engineering, product | Current Prisma schema, domain definitions, integrity requirements, and evolution plan |
| [API contracts](./API.md) | Engineering, QA, integrations | Existing route inventory and target request/response behavior |
| [Operations and setup](./OPERATIONS.md) | Engineering, operations | Local setup, environment configuration, Neon, Resend, deployment, and incident handling |
| [Staff guide](./STAFF_GUIDE.md) | Sales, content, administrators | Intended listing and lead-management workflows |
| [Quality and release](./QUALITY_AND_RELEASE.md) | Engineering, QA, product | Test strategy, accessibility/performance expectations, and launch checklist |

## Status conventions

- **Current** describes behavior or files observed in the repository. It does not imply production readiness.
- **Required** describes a product requirement that must be implemented and verified.
- **Proposed** describes an implementation direction that needs confirmation before becoming a binding design decision.
- **Open decision** requires a product, legal, or operations owner to decide.

The current application is an evolving scaffold. In particular, authentication and authorization, lead persistence, production image storage, and email delivery handling need verification and likely implementation before launch. The release gates in the product and quality documents are authoritative.

## Ownership and change process

Product owns user-facing scope, terminology, and acceptance criteria. Engineering owns technical contracts and data changes. Operations owns credentials, monitoring, and recovery procedures. Legal/privacy owners approve jurisdiction-specific terms, consent, and retention.

When a behavior changes, update the relevant requirement and its API/data/operations contract in the same change. Record unresolved product decisions in [Product requirements](./PRODUCT_REQUIREMENTS.md) rather than silently making assumptions.
