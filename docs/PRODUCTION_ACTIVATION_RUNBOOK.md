# Production Activation Runbook

## Purpose

This runbook controls the single consolidated Phase 16 production activation and client-test candidate for Family Life Admin. Clerk authentication and Neon persistence are already live. The activation brings the implemented private storage, signed email intake, bounded OCR/classification, voice drafts, opt-in notifications, retention, cleanup, service-route fix, dependency patches, and crash boundaries together on one exact verified commit.

Use GitHub and hosted providers only. Do not require development, installation, or execution on the client's computer.

## Non-Negotiable Boundaries

- Family Life Admin remains private household administration, not personal finance.
- Every live read, write, object, draft, background operation, and notification is household-scoped.
- Clerk authenticates people; PostgreSQL owns households, memberships, roles, and application records.
- External identity mapping uses immutable Clerk provider subject, never email alone.
- Bills and renewals remain source-linked administrative reminders.
- Never persist, transcribe, reproduce, log, search, classify, or notify structured payment identifiers.
- Automated intake creates a reviewable draft only; an authorised household member confirms it.
- Manual creation remains available.
- Original email, PDF, link, image, or user-confirmed source remains the source of truth.
- Raw OCR text, speech text, and temporary voice audio follow documented deletion limits.
- Never commit provider credentials, reviewer credentials, signing files, real household data, or real source documents.

## Verified Starting State — 1 August 2026

- Current `main` and latest executable candidate: `07807e2c24b89b4420d0ffb6b33d2847e4c81fd0`.
- PRs #113–#124 were inspected and integrated in dependency order with passing exact-head CI and no unresolved review threads.
- PR #124 exact head `97c0a694b67008739885e35d493646063f73888e` passed CI run `30697413278` and merged dependency/crash-readiness gates as current `main`.
- Production dependency audit reports zero high-severity findings; three moderate findings remain below the enforced high-severity release threshold.
- No pull request is open. Issue #70 is the current Phase 16-to-App-Review tracker.
- Vercel deployment `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL` remains Ready on old `main` `4233d14e4f77d096120a3d90c4b42d2928779f3d`; no integration PR triggered Vercel.
- No Vercel runtime error cluster was present in the preceding 24 hours.
- The old deployment still returns 404 for scheduled cleanup/notification routes. The merged route fix must be verified after the single controlled candidate deployment.
- Neon project `life-admin-production` uses PostgreSQL 17. Primary branch `br-square-voice-aj67a94o` is Ready with 8/8 finished migrations, zero rollbacks, 28 public tables, and exact repository migration checksums.
- Neon branch protection is disabled and restore history is six hours. Record release-candidate cold-start timing and the intended branch lifecycle.
- The repository includes fail-closed live-mode validation for private R2, Cloudflare AI, signed email, and operations configuration.
- Direct live dashboard attestation remains required for Clerk, R2, Email Routing, Workers AI, Expo, and Vercel environment names/value presence. Repository implementation alone is not provider-readiness evidence.

This state does not approve a deployment, provider mutation, client acceptance, Apple account action, App Review submission, or public release.

## Vercel Conservation Rule

1. Keep automatic Git deployments disabled for branches and pull requests.
2. Do not deploy documentation, routine PRs, isolated fixes, rebases, metadata, screenshots, EAS/TestFlight work, or evidence refreshes.
3. Permit one controlled Phase 16 deployment only after every precondition below passes.
4. Use that deployment for authentication, providers, production smoke, Rivera acceptance, and client-candidate evidence.
5. If client acceptance exposes executable blockers, batch them and permit at most one final redeployment after reviewed PRs and green exact-head CI.
6. Never use a no-op commit or unchanged redeployment to refresh evidence.

## Activation Preconditions

Do not deploy until all are true:

1. The selected candidate is current `main` or a later explicitly frozen commit with passing exact-head required CI.
2. No open PR, unresolved review thread, or earlier implementation dependency remains.
3. Production dependency audit has no high-severity findings; remaining moderate findings have release-impact disposition.
4. Web/native typecheck, lint, build/export, browser smoke, store checks, Prisma checks, privacy/security/payment-source tests, service-route tests, retention/deletion tests, accessibility checks, and crash boundaries pass.
5. All eight Neon migration records, checksums, 28 tables, zero rollback records, recovery state, and rollback path are reverified.
6. Clerk production domain, Native API, redirect/deep-link allowlists, and configuration name/value presence are attested without exposing values.
7. Vercel production environment names/value presence satisfy the fail-closed activation check.
8. R2 public access is disabled; CORS, multipart cleanup, quarantine, lifecycle, deletion, and orphan handling are ready.
9. Email Routing alias, Worker binding, signature-secret presence, replay window, duplicate suppression, size/type limits, source retention, and rotation/revocation paths are ready.
10. Workers AI bindings and OCR/classification/voice adapters remain bounded, review-first, temporary, redacted, and excluded from logs.
11. Notification preferences, token lifecycle, quiet hours, generic previews, deep links, retries, deduplication, revocation, and sign-out cleanup are ready.
12. Cleanup/notification schedulers use narrow bearer authentication, have retry/deduplication and stop controls, and expose content-safe observability.
13. Expo project ownership, production environment names, build profiles, and Android/iOS candidate capacity are attested.
14. Previous Ready Vercel deployment `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL` remains available as rollback.
15. The release owner has approved any required credential, paid-plan, or irreversible provider action.

Secret values must never be recorded in a PR, issue, log, screenshot, artifact, or test evidence.

## Supported Runtime Pair

Production supports only:

- `FAMILY_LIFE_ADMIN_AUTH_MODE=clerk`
- `FAMILY_LIFE_ADMIN_PERSISTENCE_MODE=prisma`

The build-time activation check must reject partial or demo/static production configuration. Do not roll production back to demo data. If activation fails, roll back the application deployment while preserving Clerk and Neon production records.

## Pre-Deployment Evidence Record

Before activation record:

- exact candidate SHA;
- exact-head CI run and required job results;
- complete diff review and review-thread status;
- production dependency-audit result;
- 8/8 migration and checksum result;
- Neon branch/table/rollback/recovery state;
- non-secret provider attestation result;
- previous Vercel Ready deployment and rollback procedure;
- owner approval for any required external mutation.

## Consolidated Activation Sequence

1. Run the fail-closed live production configuration check.
2. Trigger one controlled Vercel production deployment from the recorded exact candidate.
3. Wait for Ready or fail safely; do not retry blindly.
4. Record deployment ID, URL, timestamp, source SHA, production domain, and rollback ID.
5. Confirm `lifeadmin.grovekind.com` resolves to the new Ready deployment.
6. Execute the service-authentication matrix before testing household flows.
7. Reverify all eight migrations and production schema health.
8. Verify private R2 upload, read, rejection, quarantine, retention, deletion, and orphan cleanup with fictional files.
9. Verify signed email intake, supported attachments, duplicate suppression, alias controls, source retention, and draft-only creation.
10. Verify bounded embedded-text/OCR/classification and voice-draft flows, including redaction and temporary cleanup.
11. Verify opt-in notification registration, quiet hours, generic previews, deep links, retries, deduplication, revocation, and sign-out cleanup.
12. Run public, authenticated, error, retry, accessibility, deletion, and performance production web smoke journeys.
13. Create the fictional Rivera Household with no real personal data or payment identifiers.
14. Produce Android preview and iOS simulator candidates from the same exact commit.
15. Run documented web, native, email, provider, retention, and deletion acceptance journeys.
16. Record immutable Git, CI, Vercel, Neon, Cloudflare, Expo, test, and rollback evidence.
17. Hand the candidate to the client for explicit acceptance.

## Service-Authentication Matrix

| Request | Expected result |
| --- | --- |
| Correctly signed inbound email webhook | Accepted by route-level signature verification |
| Exact signed provider retry | Idempotently acknowledged without another source, draft, or notification |
| Missing, malformed, expired, altered-event, or invalid email signature | Rejected without source disclosure |
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
- dependency and crash-readiness gates pass;
- service and Clerk boundaries match the matrix;
- all eight migrations are healthy;
- provider flows pass with fictional data;
- deletion and retention behaviour is verified;
- web and native critical journeys pass;
- runtime logs contain no release-blocking cluster;
- rollback remains reproducible;
- no privacy, household-isolation, payment-source, accessibility, performance, or release blocker remains.

Client acceptance is a separate explicit gate. Apple enrolment, signing, TestFlight, physical-device QA, App Store declarations, submission approval, and public release approval remain separate owner-controlled gates.

## Rollback

If any privacy, access, migration, provider, crash, or release gate fails:

1. stop the affected Email route, Worker trigger, or provider adapter where independently possible;
2. roll Vercel back to `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL` or the latest explicitly recorded safe Ready deployment;
3. preserve production database and private objects;
4. investigate migrations on an isolated Neon branch;
5. revoke/rotate an affected provider credential when exposure is suspected;
6. resolve the defect through a focused reviewed PR with exact-head CI;
7. repeat every affected security, privacy, payment-source, migration, deletion, provider, web, native, performance, and crash regression gate.

Do not submit to Apple App Review without explicit release-owner approval. Do not release publicly without separate approval.
