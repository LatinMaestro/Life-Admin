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
   - `docs/MOBILE_APP_STORE_ROADMAP.md`
   - `docs/PHASES_1_TO_16.md`
   - `docs/AUTOMATED_INTAKE_ARCHITECTURE.md`
   - `docs/RECURRENCE_AND_NOTIFICATION_DESIGN.md`
   - `docs/TEST_STRATEGY_PHASES_1_TO_16.md`
2. Propose the intended change before coding unless the user explicitly approves implementation.
3. Work in scoped pull requests with clear review gates.
4. Preserve privacy rules and update documentation when product behavior changes.
5. Avoid scope creep. Email forwarding, bounded extraction/OCR/classification, voice capture, notifications, uploads/camera, and advanced recurrence are approved only within Phases 1-16 and their documented review-first boundaries. General-purpose generative AI, autonomous action creation, finance features, and payment execution remain unapproved.
6. Keep every user-facing feature and API operation household-scoped.
7. Prefer the simplest workflow that helps a beginner complete the current task.
8. Keep manual creation available for every workflow. Approved automated intake may prepare drafts only; an authorised household member must confirm them.
9. Native iOS and Android delivery is approved. Build a genuine Expo/React Native client against versioned household APIs; do not ship a thin WebView wrapper.
10. Keep platform business logic in shared server services instead of duplicating authorization rules in web or mobile clients.

## Bill And Payment Rules

Bills and renewals are admin reminders only. They may store provider, due date, renewal date, status, notes, source document/link references, and reminder metadata.

They must not store generated or transcribed payment identifiers such as BPAY biller codes, BSBs, account numbers, customer reference numbers, or payment reference values. Payment reminders should point to the original source email/PDF/link or to a user-confirmed image/crop from the original source document.

These rules apply equally to web pages, APIs, native clients, logs, analytics, and store screenshots.

## Technical Direction

- Next.js App Router web app and versioned API
- TypeScript
- Tailwind CSS and shadcn/ui for web
- Prisma and PostgreSQL
- Clerk authentication
- Vercel deployment target
- Expo/React Native with Expo Router for iOS and Android
- Shared household-scoped server services and API contracts

## Definition Of A Good Change

A good change is household-scoped, privacy-preserving, beginner-friendly, covered by the relevant review gate, and consistent across web and native clients. Intake changes must be review-first, delete temporary extraction data, reject structured payment identifiers, and preserve original sources. No change may broaden the product into SpendGrove finance behavior.
