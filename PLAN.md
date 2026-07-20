# Family Life Admin Plan

## Current Objective

Complete Phases 1-16 in `docs/PHASES_1_TO_16.md` and deliver a client-test-ready web and native application before any paid Apple Developer or Google Play setup.

Automatic Vercel Git deployments are paused during development through `vercel.json`. Re-enable them only for the controlled Phase 16 client-testing candidate.

## Product Boundary

Family Life Admin is private household administration, not personal finance. Bills and renewals are admin reminders that point to original sources. Web, API, native, email, upload, OCR, voice, background processing, and notification surfaces must never persist or reproduce structured payment identifiers.

SpendGrove remains the finance product.

## Completed Foundation

1. Documentation and original web MVP control pack.
2. Mobile-first Next.js application and calm design system.
3. Household workspace, members, roles, invitations, and settings.
4. Dashboard, inbox, tasks, reminders, shopping, bills/renewals, sources, comments, and activity.
5. Prisma/PostgreSQL schema, production Neon migration, and household-scoped persistence.
6. Clerk production authentication and provider-subject identity mapping.
7. Transactional household authorization and role enforcement.
8. Versioned household API.
9. Expo/React Native iOS and Android client with secure Clerk sessions.
10. Core native reads/writes, password recovery, release configuration, artwork, and store metadata.
11. Grovekind production domain, Clerk custom domain, Android signing, and initial Android builds.
12. Bill/payment source-of-truth guardrails and provider privacy review.
13. Private lifecycle recovery and security hardening.
14. Automated responsive browser journeys and native bundle QA.

Previous signed builds are engineering evidence only. Development continued after those builds, so the final store candidate will be rebuilt after Phase 16 approval.

## Approved Pre-Store Development

1. Architecture and control documentation.
2. First-user onboarding.
3. Complete native workflow parity.
4. Advanced recurrence.
5. Secure uploads.
6. Camera/document capture.
7. Email forwarding.
8. Text extraction and OCR.
9. Controlled classification.
10. Payment-data protection.
11. Voice capture.
12. Push notifications.
13. Automated quality and security.
14. End-to-end and emulator QA.
15. Final UI and accessibility.
16. Client app testing and approval.

The detailed scope and exit gates are in `docs/PHASES_1_TO_16.md`.

## Paid Release Boundary

Do not create paid Apple/Google developer accounts or upload store builds until:

- Phases 1-15 pass;
- the client tests the Phase 16 candidate;
- client feedback is resolved;
- the client explicitly approves the UI and feature set;
- the release candidate is frozen.

After approval, complete store accounts, final signing, TestFlight/Play internal testing, physical-device QA, forms, submission, and review fixes.

## Current Phase

Phase 15 is in final review. Phase 16 will prepare one controlled client-testing candidate, re-enable a single Vercel deployment, document the test journey, and collect approval before the paid store phase.
