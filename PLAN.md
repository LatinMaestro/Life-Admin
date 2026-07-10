# Family Life Admin Plan

## Current Objective

Continue the approved production foundation in scoped batches. The current foundation includes a Prisma/PostgreSQL schema checkpoint, access-control helpers, a server-only household access resolver, a demo access context, persistence contracts, static and Prisma read adapters, a server-only adapter selector, dashboard and module read-model foundations, a shared read-model summary component, the Sources and Activity pages on repository-backed read models, static comments mapped through the adapter, auth/session contracts, and a pure static-demo seed snapshot mapper. The running app still uses static mode by default: no live persistence, production authentication, migrations, uploads, email forwarding, AI, OCR, voice capture, notifications, native iOS, payment identifier storage, or finance features.

## Product Summary

Family Life Admin is a private household admin app for shared household coordination. It focuses on manual creation and management of household tasks, reminders, shopping lists, bills and renewals as admin reminders, shared inbox items, source document/link references, members, comments, and activity history.

The MVP is a quick-rollout mobile-first web app. The schema should support future multi-household use, while the MVP UI may optimise for one primary household.

Approved product, architecture, and scope decisions are recorded in `docs/PRODUCT_DECISIONS.md`. The current static MVP checkpoint is recorded in `docs/STATIC_MVP_COMPLETION_REVIEW.md`.

## Scope Guardrails

In scope for the production foundation path:

- Household-first Prisma/PostgreSQL schema
- Future authentication-ready user and membership model
- Household admin and household member roles
- Household access-control helpers
- Server-side household access resolver
- Demo-only access context for static repository reads
- Auth/session contracts before provider wiring
- Static and Prisma persistence adapters behind a shared contract
- Static comments through the adapter contract
- Server-only adapter selection that defaults to static mode
- Dashboard and module read-model foundations behind the adapter boundary
- Shared read-model summary UI component
- Sources and Activity pages migrated to the read-model path
- Static demo data to future seed snapshot mapping
- Module-by-module persistence migration after schema validation
- Source references as metadata/pointers only
- Bills and renewals as admin reminders only

Out of scope until separately approved:

- Budgeting
- Bank imports
- Transaction tracking
- Spend analytics
- Cashflow forecasting
- Tax reporting
- Property or loan management
- Payment instruction generation
- Email forwarding implementation
- AI extraction
- OCR extraction
- Voice capture
- Native iOS implementation
- Notification integrations
- File uploads or source storage
- Generated or transcribed payment identifiers

## Completed Static MVP Path

1. Documentation/control pack
2. App foundation
3. Household workspace
4. Members and roles
5. Dashboard
6. Shared inbox
7. Tasks and reminders
8. Shopping lists
9. Bills and renewals
10. Source documents/links
11. Comments and activity history
12. QA and review

## Production Foundation Path

1. Prisma/PostgreSQL schema checkpoint. Done.
2. Household access-control foundation. Done.
3. Persistence repository contracts. Done.
4. Prisma package, lockfile, and schema validation setup. Done.
5. Prisma client boundary and read-only adapter foundation. Done.
6. Household access resolver. Done.
7. Auth/session contract boundary. Done.
8. Seed/demo migration bridge. Done.
9. Static persistence adapter. Done.
10. Server persistence adapter selector. Done.
11. Demo access context for static repository reads. Done.
12. Dashboard read-model foundation. Done.
13. Module read-model foundations. Done.
14. Shared read-model summary UI component. Done.
15. Sources page read-model migration. Done.
16. Static comments adapter support. Done.
17. Activity page read-model migration. Done.
18. Authentication provider and session strategy.
19. Household membership enforcement in live routes/actions.
20. Move remaining UI pages fully to the adapter boundary module by module.
21. Persist shared inbox writes.
22. Persist tasks and reminders writes.
23. Persist shopping list writes.
24. Persist bills and renewals writes with source-of-truth guardrails.
25. Persist source references as metadata/pointers.
26. Persist comments and activity history.
27. Production QA and privacy review.

## Immediate Next Step

Move the remaining module pages to the repository-backed read-model path one at a time, starting with the lowest-risk static pages before live persistence or authentication is introduced.
