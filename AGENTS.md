# Family Life Admin Agent Guide

This repository is for Family Life Admin, a private household admin app. It is separate from SpendGrove and must not inherit SpendGrove scope, data models, terminology, or finance features.

## Product Boundary

Family Life Admin helps households manage shared tasks, reminders, shopping lists, bills and renewals as admin reminders, shared inbox items, source document/link references, household members, comments, and activity history.

Family Life Admin is not a personal finance product. Do not add budgeting, bank imports, transaction tracking, spend categorisation, cashflow, tax reporting, property/loan management, net worth tracking, investment tracking, or financial analytics.

## Required Working Rules

1. Inspect these documents before proposing or implementing changes:
   - `docs/PRODUCT_DECISIONS.md`
   - `docs/SPECIFICATION_SOURCE_OF_TRUTH.md`
   - `docs/MVP_SCOPE.md`
   - `docs/BILL_PAYMENT_SOURCE_OF_TRUTH_RULES.md`
   - `docs/SECURITY_AND_PRIVACY.md`
   - `docs/DATA_MODEL.md`
2. Propose the intended change before coding unless the user explicitly approves implementation.
3. Work in small, scoped changes that can be reviewed independently.
4. Preserve review gates and update documentation when product behavior changes.
5. Avoid scope creep. If a request introduces finance analytics, AI extraction, email forwarding, OCR, voice capture, native iOS, notifications, or file upload behavior before its approved phase, pause and ask for approval.
6. Preserve privacy rules for household data and source documents.
7. Keep every user-facing feature household-scoped.
8. Prefer mobile-first web workflows before desktop enhancements.
9. Keep manual creation as the MVP default.
10. Do not implement app code, packages, database schema, auth, uploads, integrations, or native app work unless the current task explicitly approves that phase.

## Bill And Payment Rules

Bills and renewals are admin reminders only. They may store provider, due date, renewal date, status, notes, source document/link references, and reminder metadata.

They must not store generated or transcribed payment identifiers such as BPAY biller codes, BSBs, account numbers, customer reference numbers, or payment reference values. Payment reminders should point to the original source email/PDF/link or to a user-confirmed image/crop from the original source document.

## Preferred Technical Direction

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Auth-ready architecture
- Vercel deployment target
- Mobile-first web app first
- Native iOS later

## Definition Of A Good Change

A good change is small, household-scoped, privacy-preserving, covered by the relevant review gate, and consistent with the MVP. It should not broaden the product into finance, AI intake, automated document extraction, or native mobile unless that phase has been approved.
