# Family Life Admin

Family Life Admin is a private household admin app for families and shared households. It helps members coordinate tasks, reminders, shopping lists, bills and renewals as admin reminders, inbox items, source references, comments, and activity history.

This project is separate from SpendGrove. It does not include budgeting, bank imports, spend tracking, transaction categorisation, cashflow, tax reporting, property/loan features, or financial analytics.

## Product Principles

- Household-first data and authorization.
- Simple, beginner-friendly workflows with one obvious action at a time.
- Manual creation remains the default.
- Mobile-first web plus approved native iOS and Android clients.
- Bills and renewals track household admin dates and original source references, not financial analysis.
- Payment reminders point back to original sources instead of storing generated or transcribed payment identifiers.
- AI, email forwarding, OCR, voice capture, notifications, and file uploads remain separately controlled phases.

## Current Product

The web app now includes live Clerk authentication, Neon/PostgreSQL persistence, household membership enforcement, invitation acceptance, household settings, dashboard, inbox routing, tasks and reminders, shopping lists, bills and renewals, source references, comments, and activity history.

The `mobile/` project is now a genuine Expo/React Native client for iOS and Android. It uses Clerk secure sessions and the authenticated household API. It is not a WebView wrapper; native write workflows and store release work remain in progress.

## Technology

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- Neon PostgreSQL
- Clerk
- Vercel
- Expo and React Native for iOS and Android

## Documentation Map

- `PLAN.md` - current delivery status and remaining plan
- `docs/PRODUCT_DECISIONS.md` - approved product and architecture decisions
- `docs/SPECIFICATION_SOURCE_OF_TRUTH.md` - canonical product specification
- `docs/MVP_SCOPE.md` - original web MVP boundaries
- `docs/MOBILE_APP_STORE_ROADMAP.md` - iOS, Android, API, testing, and store-release plan
- `docs/REVIEW_GATES.md` - required release gates
- `docs/DEFINITION_OF_DONE.md` - completion criteria
- `docs/DESIGN_SYSTEM.md` - simple mobile-first design direction
- `docs/SECURITY_AND_PRIVACY.md` - household privacy rules
- `docs/ACCESS_CONTROL.md` - membership and permission enforcement
- `docs/DATA_MODEL.md` - household-scoped data model
- `docs/PRODUCTION_ACTIVATION_RUNBOOK.md` - controlled web activation
- `docs/FUTURE_PHASES.md` - capabilities that remain deferred
- `docs/BILL_PAYMENT_SOURCE_OF_TRUTH_RULES.md` - strict bill/payment rules
- `docs/IOS_FUTURE_ROADMAP.md` - historical iOS roadmap and current cross-platform direction

## Quality Checks

GitHub Actions validates the web app and native app independently. The web job runs all existing privacy, migration, typecheck, and build gates; the mobile job installs the Expo project and runs its strict TypeScript check.

```bash
pnpm install
pnpm lint
pnpm guardrails:payment-source
pnpm guardrails:static-data-boundary
pnpm guardrails:migration
pnpm db:validate
pnpm typecheck
pnpm build
```
