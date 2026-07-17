# Family Life Admin Plan

## Current Objective

Move the completed household web and native applications through final production activation, physical-device quality assurance, signed builds, and store submission. The production data model, Clerk identity mapping, household access enforcement, live manual workflows, privacy guardrails, beginner-friendly interfaces, native release configuration, and store materials are implemented.

Notifications, uploads, email forwarding, AI, OCR, and voice capture remain deferred.

## Product Boundary

Family Life Admin is private household administration, not personal finance. Bills and renewals are admin reminders that point to original sources. Web, API, iOS, and Android surfaces must never store, display, generate, or transcribe payment identifiers.

## Completed

1. Documentation and control pack.
2. Mobile-first web foundation.
3. Household workspace, members, and roles.
4. Dashboard and shared inbox.
5. Tasks and reminders.
6. Shopping lists.
7. Bills and renewals with source-only rules.
8. Source references.
9. Comments and activity history.
10. Prisma/PostgreSQL production schema and Neon migration.
11. Clerk authentication and household membership enforcement.
12. Household invitations and member administration.
13. Live household-scoped create, update, complete, reopen, archive, and routing workflows.
14. Beginner usability and production code/privacy review.
15. Release candidate merged to `main`.
16. Authenticated, household-scoped mobile API.
17. Expo iOS and Android app with secure Clerk sessions and core native workflows.
18. Native household comments, activity, invitations, roles, settings, assignments, and task dates.
19. EAS build configuration, stable app identifiers, deterministic icons and splash artwork.
20. App Store and Google Play listing copy, review notes, and submission checklist.

## Remaining Delivery Plan

### Phase A: Production Activation

- Approve and attach a stable custom production domain.
- Move Clerk and mobile clients to production keys for that domain.
- Confirm production environment variables and run the live release gate.
- Run authenticated web smoke tests against production.

### Phase B: Physical Device QA

- Build internal iOS and Android releases with EAS.
- Test sign-in, household isolation, invitation acceptance, writes, source-link safety, account deletion, accessibility, and recovery states.
- Test representative phones and tablets on supported OS versions.
- Record and resolve any release-blocking defects.

### Phase C: Store Submission

- Capture final screenshots using fictional household data.
- Complete Apple privacy and Google Play Data safety forms from the approved privacy documentation.
- Supply support and privacy URLs on the custom domain.
- Create a private reviewer account and provide credentials only through store review consoles.
- Submit version 1.0.0 after all checklist items pass.

## Immediate Next Step

Complete the external release setup: custom domain, production Clerk configuration, Expo project/signing credentials, developer accounts, internal builds, and physical-device QA. No additional product features are required for the first store candidate unless QA identifies a release-blocking issue.
