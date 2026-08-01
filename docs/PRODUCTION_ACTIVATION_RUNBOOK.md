# Production Activation Runbook

## Purpose

This runbook controls the consolidated Phase 16 production activation and client-test candidate for Family Life Admin. Clerk authentication and Neon persistence are already live. The remaining activation brings the implemented private storage, signed email intake, bounded OCR/classification, voice drafts, opt-in notifications, retention, cleanup, and native candidate paths together on one exact verified commit.

Use GitHub and hosted providers only. Do not require development, installation, or execution on the client's computer.

## Non-Negotiable Boundaries

- Family Life Admin remains private household administration, not personal finance.
- Every live read, write, asset, draft, background job, and notification is household-scoped.
- Clerk authenticates people; PostgreSQL owns households, memberships, roles, and application records.
- External identity mapping uses the immutable Clerk provider subject, never email alone.
- Bills and renewals remain source-linked administrative reminders.
- Never persist, transcribe, reproduce, log, search, classify, or notify structured payment identifiers.
- Automated intake creates a reviewable draft only; an authorised household member confirms it.
- Manual creation remains available.
- Original email, PDF, link, image, or user-confirmed source remains the source of truth.
- Raw OCR text, speech text, and temporary voice audio follow the documented deletion limits.
- Never commit provider credentials, reviewer credentials, signing files, real household data, or real source documents.

## Verified Starting State — 31 July 2026

- Production Vercel deployment `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL` is Ready on main `4233d14e4f77d096120a3d90c4b42d2928779f3d`.
- Production runtime uses the supported `clerk` authentication and `prisma` persistence pair.
- Neon production uses PostgreSQL 17 and records all eight reviewed migrations as finished and not rolled back.
- The private R2 bucket is provisioned with public access disabled, Grovekind PUT-only CORS, and one-day incomplete multipart cleanup.
- The reviewed Email and operations Workers are staged with public development URLs disabled.
- Runtime evidence shows the operations trigger is active and reaches both internal endpoints, but current main returns 404 because Clerk intercepts service-authenticated routes.
- PR #113 is the scoped route-boundary fix. It must not merge until exact-head required checks execute and pass.
- Draft PR #114 reconciles release, privacy, permission, provider, and store documentation and must follow #113.

This state is evidence only. It does not approve a deployment, provider mutation, client acceptance, Apple account action, App Review submission, or public release.

## Activation Preconditions

Do not deploy until all of the following are true:

1. PR #113 has passing required checks on its exact immutable head, complete diff review, and no unresolved threads.
2. PR #113 is merged and the resulting main commit is verified without triggering Vercel.
3. PR #114 is retargeted to verified main, contains only its intended documentation/store-metadata files, passes exact-head checks, is reviewed, and is merged.
4. Combined main is reviewed and required CI is green.
5. All eight production migration records and repository migration checksums are reverified.
6. Clerk, Neon, R2, Email Routing, Workers AI, Expo, and Vercel environment names are reconciled without exposing values.
7. R2 privacy, CORS, lifecycle, quarantine, deletion, and orphan-recovery settings are ready.
8. Email signature, timestamp, replay, duplicate, size, type, original-source, and alias-rotation controls are ready.
9. OCR/classification and voice providers are bounded, review-first, temporary, redacted, and excluded from logs.
10. Notification preferences, token lifecycle, quiet hours, generic previews, deep links, retries, deduplication, and sign-out cleanup are ready.
11. The previous Ready Vercel deployment remains available as the rollback target.
12. The release owner has approved any required production credential or provider-account action. No paid plan or irreversible change is inferred.

## Supported Runtime Pair

Production supports only:

- `FAMILY_LIFE_ADMIN_AUTH_MODE=clerk`
- `FAMILY_LIFE_ADMIN_PERSISTENCE_MODE=prisma`

The build-time activation check must reject partial or demo/static production configuration. Do not roll production back to demo data. If activation fails, roll back the deployment while preserving Clerk and Neon production records.

## Consolidated Activation Sequence

1. Record the exact verified main commit, passing CI run, migration state, provider preflight, and rollback deployment.
2. Perform one controlled production deployment from that exact commit.
3. Confirm `lifeadmin.grovekind.com` resolves to the new Ready deployment.
4. Verify the service-authentication matrix below before testing product flows.
5. Verify private R2 upload, read, quarantine, rejection, retention, deletion, and orphan cleanup with fictional files.
6. Verify signed forwarded-email intake, supported attachments, duplicate suppression, alias rotation, original-source retention, and draft-only creation.
7. Verify bounded embedded-text/OCR/classification and voice draft flows, including redaction and temporary-data cleanup.
8. Verify opt-in notification registration, quiet hours, safe previews, deep links, retries, deduplication, revocation, and sign-out cleanup.
9. Reverify all eight migrations and production schema health.
10. Run the public and authenticated production web smoke journeys.
11. Create the fictional Rivera Household data set with no real personal data or payment identifiers.
12. Produce current Android preview and iOS simulator candidates from the same exact commit.
13. Run the documented web, native, and email acceptance journeys.
14. Record immutable Git, CI, Vercel, Neon, Cloudflare, EAS, test, and rollback evidence.
15. Hand the candidate to the client for explicit acceptance.

## Service-Authentication Matrix

Required results after the controlled deployment:

| Request | Expected result |
| --- | --- |
| Correctly signed inbound email webhook | Accepted by route-level signature verification |
| Missing, malformed, expired, replayed, or invalid email signature | Rejected without source disclosure |
| Valid cleanup bearer request | Accepted by route-level secret verification |
| Valid notification-dispatch bearer request | Accepted by route-level secret verification |
| Missing, short, or invalid bearer secret | Rejected |
| Ordinary signed-out app or household API request | Clerk protection applies |
| Lookalike or child path of a service endpoint | Does not bypass Clerk |
| Cross-household authenticated request | Rejected without revealing target existence |

Record status categories and opaque request identifiers only. Never record secrets, source bodies, extracted fields, notification text, or payment identifiers.

## Acceptance Gates

Activation passes only when:

- the exact deployed commit has passing required CI;
- service and Clerk boundaries match the matrix;
- all eight migrations are healthy;
- provider flows pass with fictional data;
- deletion and retention behaviour is verified;
- web and native critical journeys pass;
- rollback remains reproducible;
- no privacy, household-isolation, payment-source, accessibility, or release blocker remains.

Client acceptance is a separate explicit gate. Apple enrolment, signing, TestFlight, physical-device QA, App Store declarations, submission approval, and public release approval remain separate owner-controlled gates.

## Rollback

If any privacy, access, migration, provider, or release gate fails:

1. stop the affected Email route, Worker trigger, or provider adapter where independently possible;
2. roll Vercel back to `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL` or the latest explicitly recorded safe Ready deployment;
3. preserve production database and private objects;
4. investigate migrations on an isolated Neon branch;
5. revoke or rotate an affected provider credential when exposure is suspected;
6. resolve the defect through a focused reviewed PR with exact-head CI;
7. repeat every affected security, privacy, payment-source, migration, deletion, provider, web, and native regression gate before reactivation.

Do not submit to Apple App Review without explicit release-owner approval. Do not release publicly without separate approval.
