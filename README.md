# Family Life Admin

Family Life Admin is a private household admin app for families and shared households. It helps members coordinate tasks, reminders, shopping lists, bills and renewals as admin reminders, inbox items, source references, comments, and activity history.

This project is separate from SpendGrove. It does not include budgeting, bank imports, spend tracking, transaction categorisation, cashflow, tax reporting, property/loan features, or financial analytics.

## Product Principles

- Household-first data and authorization.
- Simple, beginner-friendly workflows with one obvious action at a time.
- Manual creation remains available for every workflow; approved automated intake creates reviewable drafts only.
- Mobile-first web plus approved native iOS and Android clients.
- Bills and renewals track household admin dates and original source references, not financial analysis.
- Payment reminders point back to original sources instead of storing generated or transcribed payment identifiers.
- Email forwarding, secure uploads/camera, OCR, bounded classification, voice capture, advanced recurrence, and opt-in notifications use strict privacy and confirmation gates.

## Current Product

The web app includes Clerk authentication, Neon/PostgreSQL persistence, household membership enforcement, invitation acceptance, household settings, dashboard, inbox routing, tasks and reminders, shopping lists, bills and renewals, source references, comments, activity, recurrence, private source intake, review-first classification, and notification controls.

The `mobile/` project is a genuine Expo/React Native client for iOS and Android. It uses Clerk secure sessions and the authenticated household API. Native household workflows, camera and document capture, voice capture, private review drafts, release configuration, artwork, and store copy are implemented.

Phases 1-15 are complete. Phase 16 prepares one controlled web and native candidate for client acceptance before any paid Apple Developer or Google Play work.

## Technology

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- Neon PostgreSQL
- Clerk
- Vercel
- Cloudflare R2, Email Routing, Email Workers, and Workers AI
- Expo and React Native for iOS and Android

## Documentation Map

- `PLAN.md` - current delivery status and remaining plan
- `docs/PRODUCT_DECISIONS.md` - approved product and architecture decisions
- `docs/SPECIFICATION_SOURCE_OF_TRUTH.md` - canonical product specification
- `docs/MVP_SCOPE.md` - original web MVP boundaries
- `docs/MOBILE_APP_STORE_ROADMAP.md` - iOS, Android, API, testing, and store-release plan
- `docs/PHASES_1_TO_16.md` - approved pre-store development sequence and exit gates
- `docs/CLIENT_TESTING.md` - fictional acceptance journey for the Phase 16 candidate
- `docs/RELEASE_CANDIDATE.md` - release manifest, deployment controls, and known external gates
- `docs/AUTOMATED_INTAKE_ARCHITECTURE.md` - upload, email, OCR, classification, voice, retention, and redaction architecture
- `docs/RECURRENCE_AND_NOTIFICATION_DESIGN.md` - recurrence, scheduling, preferences, and safe delivery rules
- `docs/TEST_STRATEGY_PHASES_1_TO_16.md` - automated, integration, API, provider, end-to-end, and emulator test strategy
- `docs/FINAL_UI_REVIEW.md` - final beginner-friendly UI and accessibility acceptance
- `docs/STORE_LISTING.md` - approved App Store and Google Play listing copy
- `mobile/store.config.json` - machine-readable Apple App Store metadata
- `docs/STORE_PRIVACY_DECLARATIONS.md` - current data inventory and draft store privacy answers
- `docs/STORE_SUBMISSION_CHECKLIST.md` - release-owner checklist for signed builds and submission
- `docs/STORE_CONSOLE_HANDOFF.md` - client-only Apple, Google Play, Expo, review, and final-approval steps
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

GitHub Actions validates privacy boundaries, migrations, recurrence, secure intake, notifications, authorization, TypeScript, production builds, responsive browser journeys, and both native platform exports from a clean checkout.
