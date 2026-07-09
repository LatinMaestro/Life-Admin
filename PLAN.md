# Family Life Admin Plan

## Current Objective

Continue the approved production foundation in scoped batches. The current foundation includes a Prisma/PostgreSQL schema checkpoint, access-control helpers, and persistence contracts. The running app still uses static demo data: no live persistence, production authentication, migrations, uploads, email forwarding, AI, OCR, voice capture, notifications, native iOS, payment identifier storage, or finance features.

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
- Persistence contracts for future module migration
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

1. Prisma/PostgreSQL schema checkpoint
2. Household access-control foundation
3. Persistence repository contracts
4. Prisma package, lockfile, and schema validation setup
5. Authentication provider and session strategy
6. Household membership enforcement
7. Seed/demo migration path from static data
8. Persist dashboard source queries
9. Persist shared inbox
10. Persist tasks and reminders
11. Persist shopping lists
12. Persist bills and renewals with source-of-truth guardrails
13. Persist source references as metadata/pointers
14. Persist comments and activity history
15. Production QA and privacy review

## Immediate Next Step

Add Prisma dependencies and validation scripts with a regenerated lockfile in a safe build environment. Do not wire app pages to the database until schema validation passes and access-control helpers are connected to an authenticated household membership context.
