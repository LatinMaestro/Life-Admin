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

## Verified Starting State — 1 August 2026

- PR #113 passed exact-head CI run 30207082000, including web/browser job 91330296765 and native job 91330296759, and was squash-merged as 2838a9fa55ae4f22feae0390284ca899b1efbe18.
- PR #114 exact head f489e6887f5e9fbe53d78c2afa825aaad43985ed passed CI run 30687110059. Its intended eleven-file documentation/store-metadata diff had no reviews or unresolved threads and was squash-merged as current main 2de83f6315839bf1e1907e6d13dc0dc369f57e5d.
- No pull request is open. Issue #70 is the current Phase 16-to-App-Review delivery tracker.
- Production Vercel deployment dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL remains Ready on old main 4233d14e4f77d096120a3d90c4b42d2928779f3d. No deployment was triggered by integration.
- Production runtime uses the supported Clerk authentication and Prisma persistence pair.
- Neon production uses PostgreSQL 17 and records all eight reviewed migrations as finished and not rolled back; 28 public tables are present.
- The private R2 bucket is provisioned with public access disabled, Grovekind PUT-only CORS, and one-day incomplete multipart cleanup.
- The reviewed Email and operations Workers are staged with public development URLs disabled.
- Runtime evidence shows the operations trigger is active and reaches both internal endpoints. The old production deployment still returns 404; route-level authentication must be verified after the single controlled candidate deployment.

This state is evidence only. It does not approve a deployment, provider mutation, client acceptance, Apple account action, App Review submission, or public release.

## Activation Preconditions

Do not deploy until all of the following are true:

1. Integration main is 2de83f6315839bf1e1907e6d13dc0dc369f57e5d after PR #113 and PR #114 passed exact-head CI, complete diff review, and thread checks and merged without triggering Vercel.
2. No open pull request or active implementation stack precedes provider preflight.
3. All eight production migration records and repository migration checksums are reverified.
4. Clerk, Neon, R2, Email Routing, Workers AI, Expo, and Vercel environment names are reconciled without exposing values.
5. R2 privacy, CORS, lifecycle, quarantine, deletion, and orphan-recovery settings are ready.
6. Email signature, timestamp, replay, duplicate, size, type, original-source, and alias-rotation controls are ready.
7. OCR/classification and voice providers are bounded, review-first, temporary, redacted, and excluded from logs.
8. Notification preferences, token lifecycle, quiet hours, generic previews, deep links, retries, deduplication, and sign-out cleanup are ready.
9. The previous Ready Vercel deployment remains available as the rollback target.
10. The release owner has approved any required production credential or provider-account action. No paid plan or irreversible change is inferred.

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
