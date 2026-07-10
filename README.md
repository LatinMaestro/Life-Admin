# Family Life Admin

Family Life Admin is a private household admin web app for families and shared households. It helps household members coordinate shared tasks, reminders, shopping lists, bills and renewals as admin reminders, source document/link references, comments, and activity history in one shared workspace.

This project is separate from SpendGrove. It must not include budgeting, bank imports, spend tracking, transaction categorisation, cashflow, tax reporting, property/loan features, or financial analytics.

## Product Principles

- Household-first data model.
- Mobile-first web app first.
- Family sharing from day one.
- Manual task, list, reminder, bill, renewal, and inbox item creation first.
- AI, email forwarding, OCR, voice capture, notifications, and native iOS are future phases.
- Bills and renewals track household admin due dates and source documents, not financial analysis.
- Payment reminders link back to original source documents or user-confirmed source crops instead of storing generated or transcribed payment identifiers.

## MVP Modules

1. Household workspace
2. Family members
3. Dashboard
4. Shared inbox
5. Tasks and reminders
6. Shopping lists
7. Bills and renewals
8. Source documents/links
9. Comments and activity history
10. Basic settings

## Technology Assumptions

The app foundation uses these choices. The Prisma/PostgreSQL schema and initial migration checkpoints exist, but the migration has not been applied and live persistence, production authentication, uploads, and integrations have not been activated.

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Auth-ready architecture
- Vercel deployment target
- Mobile-first web first, native iOS later

## Documentation Map

- `PLAN.md` - delivery plan and phase sequence
- `docs/PRODUCT_DECISIONS.md` - approved product, architecture, and scope decisions
- `docs/SPECIFICATION_SOURCE_OF_TRUTH.md` - canonical product specification
- `docs/MVP_SCOPE.md` - MVP in-scope and out-of-scope rules
- `docs/BUILD_PLAN.md` - staged build plan
- `docs/REVIEW_GATES.md` - review gates before phase completion
- `docs/DEFINITION_OF_DONE.md` - completion criteria
- `docs/DESIGN_SYSTEM.md` - mobile-first design direction
- `docs/SECURITY_AND_PRIVACY.md` - household privacy and document rules
- `docs/ACCESS_CONTROL.md` - household membership and permission enforcement rules
- `docs/AUTH_SESSION_DESIGN.md` - future auth/session boundary and current placeholder behavior
- `docs/AUTHENTICATION_PROVIDER_DECISION.md` - Clerk recommendation and controlled implementation sequence
- `docs/DATA_MODEL.md` - household-scoped data model and Prisma schema checkpoint
- `docs/PERSISTENCE_MIGRATION_PLAN.md` - module-by-module static-to-live data migration plan
- `docs/SEED_DATA_MIGRATION.md` - static demo data to future seed snapshot mapping rules
- `docs/FUTURE_PHASES.md` - deferred capabilities and boundaries
- `docs/EMAIL_FORWARDING_DESIGN.md` - future email forwarding design notes
- `docs/BILL_PAYMENT_SOURCE_OF_TRUTH_RULES.md` - strict bill/payment rules
- `docs/IOS_FUTURE_ROADMAP.md` - later native iOS direction
- `docs/PHASE_11_QA_REVIEW.md` - static MVP QA review result
- `docs/STATIC_MVP_COMPLETION_REVIEW.md` - current static MVP checkpoint and next decision point

## Current Status

The static web MVP covers the approved household workspace modules through comments, activity history, source references, and basic settings. A Prisma/PostgreSQL schema and reviewed initial migration checkpoint have started the production foundation path, access-control helpers define the future household membership enforcement pattern, persistence contracts define the future live-data boundary, the approved Clerk foundation includes provider-neutral sessions, internal-user mapping, public sign-in states, and protected workspace boundaries, a pure demo seed snapshot maps static data toward future database seeding, and a server-only adapter selector defaults persistence to static mode.

The running app still defaults to static/demo mode. Clerk activation is waiting on environment provisioning, the first database migration, and mapped household membership. It does not yet have live persistence, active production authentication, migrations, uploads, email forwarding, AI, OCR, voice capture, notifications, native iOS implementation, finance analytics, or payment identifier storage.

## Production Foundation Path

1. Prisma/PostgreSQL schema checkpoint
2. Prisma package, lockfile, and schema validation setup
3. Auth/session contract boundary
4. Seed/demo migration bridge
5. Static and Prisma adapter boundary
6. Authentication provider and session strategy
7. Household membership enforcement
8. Module-by-module persistence migration from static data

## Persistence Mode

Server-side persistence selection uses `FAMILY_LIFE_ADMIN_PERSISTENCE_MODE`.

The default is `static`. The `prisma` mode should only be used after production authentication, database environment variables, and live-read rollout are approved.

## Cloud Checks

GitHub Actions runs install, lint, payment source guardrails, static data boundary checks, initial migration review, Prisma validation, Prisma client generation, typecheck, and build checks on pull requests and pushes to `main`. This is the preferred verification path when local storage is constrained.

The payment guardrail scans app source and Prisma schema files, while documentation remains free to name the forbidden payment concepts so the rules stay clear.

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the app:

```bash
pnpm dev
```

Quality checks:

```bash
pnpm lint
pnpm guardrails:payment-source
pnpm guardrails:static-data-boundary
pnpm guardrails:migration
pnpm db:validate
pnpm typecheck
pnpm build
```