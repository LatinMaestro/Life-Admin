# Family Life Admin Plan

## Current Objective

Move the completed household web application through release hardening and into approved native iOS and Android delivery. The production data model, Clerk identity mapping, household access enforcement, live manual workflows, privacy guardrails, and beginner-friendly web interface are implemented.

The immediate work is to establish a stable versioned mobile API and store-readiness controls before building the Expo client. Notifications, uploads, email forwarding, AI, OCR, and voice capture remain deferred.

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

## Remaining Delivery Plan

### Phase A: Web Production Verification

- Complete a production deployment after Vercel build capacity is available.
- Run authenticated desktop and mobile workflow QA.
- Verify invitation, role recovery, multi-household isolation, source-link safety, and error states.
- Move Clerk from development keys to production keys when the custom domain and DNS are approved.

### Phase B: Release And Store Compliance

- Publish privacy policy, support, and account-deletion web resources.
- Add in-app account deletion with last-admin and household ownership safeguards.
- Define data retention and deletion handling across Clerk and PostgreSQL.
- Prepare Apple privacy details and Google Play Data safety declarations.
- Prepare a stable reviewer demo account or approved full-feature demo mode.
- Complete accessibility, empty/error state, and device QA.

### Phase C: Versioned Mobile API

- Add `/api/v1` authenticated household endpoints.
- Reuse server authorization and persistence services.
- Publish stable TypeScript contracts with ISO date serialization.
- Add request validation, safe error envelopes, rate limits where justified, and API tests.
- Keep source references metadata/link-only and fail closed outside live Clerk mode.

### Phase D: Expo Native App

- Add an Expo Router application for iOS and Android.
- Use Clerk Expo with secure token storage.
- Implement Home, Inbox, Tasks, Shopping, Bills/Renewals, Family, Sources, Activity, and Settings.
- Match the web app's plain language and one-primary-action interaction model.
- Add local loading/error states and safe retry behavior.
- Do not add notifications, uploads, camera, OCR, AI, or voice capture in this phase.

### Phase E: Store Testing And Submission

- Configure bundle identifiers, signing, EAS Build, and environment separation.
- Test physical iPhone/iPad and Android phone/tablet builds.
- Distribute through TestFlight and Google Play internal testing.
- Produce icons, screenshots using fictional data, descriptions, age ratings, support URL, and review notes.
- Submit to the Apple App Store and Google Play only after privacy, deletion, authentication, and reviewer-access gates pass.

## Immediate Next Step

Complete the mobile-store foundation batch: reconcile product decisions, add installable web metadata, and establish the read-only authenticated `/api/v1/bootstrap` boundary. Follow with tested module endpoints and the Expo application scaffold.
