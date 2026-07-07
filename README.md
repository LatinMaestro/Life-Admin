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

The app foundation uses these choices. Database schema, auth, uploads, and integrations have not been created yet.

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
- `docs/DATA_MODEL.md` - proposed household-scoped entities
- `docs/FUTURE_PHASES.md` - deferred capabilities and boundaries
- `docs/EMAIL_FORWARDING_DESIGN.md` - future email forwarding design notes
- `docs/BILL_PAYMENT_SOURCE_OF_TRUTH_RULES.md` - strict bill/payment rules
- `docs/IOS_FUTURE_ROADMAP.md` - later native iOS direction

## Current Status

Phase 2 static household workspace architecture has been added. The app contains typed household-scoped demo data and static placeholder routes only, with no persistence, authentication, uploads, email forwarding, AI, OCR, voice capture, notifications, or native iOS implementation.

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
pnpm typecheck
pnpm build
```
