# Release Candidate

## Candidate Boundary

This document controls the single Phase 16 client-testing candidate and the later frozen iOS 1.0.0 candidate. It does not by itself approve an App Store submission or public release.

The candidate includes the household workspace, recurrence, private source uploads, camera capture, forwarded email, bounded OCR/classification, voice drafts, notification preferences, lifecycle recovery, and household-scoped web/native clients.

It excludes banking, budgeting, transaction tracking, spend analysis, cashflow, tax, property, loans, payment execution, and structured payment identifiers. Automated intake creates reviewable drafts only; an authorised household member confirms them, and manual creation remains available.

## Release Components

- Web/API: Next.js production deployment at https://lifeadmin.grovekind.com
- Authentication: Clerk production instance and custom Grovekind domain
- Database: Neon PostgreSQL 17 with all eight reviewed migrations
- Android: EAS internal preview candidate
- iOS before owner gate: EAS simulator candidate
- iOS after owner gate: signed production/TestFlight build
- Storage: private Cloudflare R2 with public access disabled
- Email: signed inbound Email Worker
- Processing: bounded OCR/classification and voice adapters
- Notifications: explicit opt-in registration and preference flow
- Operations: bearer-authenticated cleanup and notification dispatch endpoints

## Verified Repository Candidate — 1 August 2026

- Current `main` and latest executable candidate: `2df917bea662f940c9c631a130baae99455b8a99`.
- No pull request is open.
- Issue #70 is the current Phase 16-to-App-Review tracker.
- PRs #113–#127 were reviewed and integrated in dependency order with passing exact-head CI.
- PR #124 exact head `97c0a694b67008739885e35d493646063f73888e` passed CI run `30697413278`, had no reviews or unresolved threads, and merged dependency/crash gates as `07807e2c24b89b4420d0ffb6b33d2847e4c81fd0`.
- PR #126 exact head `f4f393be1fa2ed6c075b6be9b9c93c6d9a3104f8` passed CI run `30700645080` and merged the reproducible mobile lock plus `npm ci` as `06144e9045b530bb21571f2e8b8bf3999b1b699b`.
- PR #127 exact head `0608038ad3bfdf2b9493b4a143fc8a38a449517a` passed CI run `30700781844` and merged two actionable moderate web patches as current `main`.
- Web and native production audits report zero high or critical findings. One Windows-only Hono advisory remains in Prisma development tooling; the mobile audit's 23 moderate dependency nodes trace to one transitive `uuid` advisory. Application code reaches neither vulnerable API, and compatible upstream fixes are unavailable.
- Next.js route/global error boundaries and the Expo Router error boundary are present and verified in CI.
- Private-object deletion and terminal intake cleanup archive empty source references and generated review items while preserving manual sources and sources with another live draft.
- Exact signed email retries are acknowledged idempotently without another source, draft, or notification. Missing, malformed, expired, altered-event, and invalid signatures are rejected.
- Live production builds fail closed unless approved private R2, Workers AI, signed-email, and operations configuration is present and internally consistent.

## Verified Hosted State

### Neon

- Project `life-admin-production`, PostgreSQL 17.
- Primary branch `br-square-voice-aj67a94o` is Ready.
- 8/8 migrations finished; zero rollback records.
- 28 public tables.
- Applied checksums match repository migration sources.
- Branch protection disabled; six-hour restore history.
- Release-candidate cold-start timing and branch-lifecycle acceptance remain pending.

### Vercel

- Production remains Ready on `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL`.
- Deployed source is old commit `4233d14e4f77d096120a3d90c4b42d2928779f3d`.
- No runtime error cluster was present in the preceding 24 hours.
- The current repository candidate is not deployed.
- The old Ready deployment is the rollback target.

### Provider boundary

Clerk, private R2, Email Routing, Workers AI, Expo, and Vercel production environment name/value presence still require direct non-secret attestation. Do not infer readiness from repository code.

## Candidate Construction

1. Complete all repository and provider preflight in `PLAN.md`.
2. Select an exact candidate SHA with green exact-head CI and complete diff review.
3. Reverify migrations, dependency threshold, provider attestation, and rollback.
4. Run one controlled Vercel production deployment.
5. Verify the full service-authentication matrix and provider flows.
6. Create the fictional Rivera Household.
7. Run production web/email/provider acceptance.
8. Build Android preview and iOS simulator candidates from the same SHA.
9. Run native acceptance and record immutable evidence.
10. Obtain explicit client acceptance.
11. Resolve blockers through focused reviewed PRs; batch any Vercel-affecting fixes.
12. Freeze the accepted exact commit as version 1.0.0.
13. After Apple owner gates, build/upload the signed iOS candidate to TestFlight.
14. Complete physical iPhone/iPad QA and App Store Connect materials.
15. Run the final Go/No-Go audit and stop for explicit submission approval.

## Candidate Evidence Manifest

The client candidate must record:

- exact Git commit and merge ancestry;
- exact-head CI run, jobs, and dependency-audit result;
- Vercel deployment ID, URL, timestamp, source SHA, domain assignment, and rollback;
- Neon project/branch, migration count, checksums, table count, rollback count, recovery state, and cold-start timing;
- non-secret Clerk, R2, Email Routing, Workers AI, Expo, scheduler, and Vercel environment attestations;
- production service-authentication and provider journey results;
- Rivera Household acceptance results;
- EAS Android and iOS simulator build references;
- explicit client acceptance or outstanding blocking feedback.

The frozen signed candidate adds:

- frozen SHA, version, build number, and freeze manifest;
- Apple Team and App Store Connect app-record confirmation without credentials;
- EAS signed iOS build reference and artifact evidence;
- TestFlight build/processing result;
- physical iPhone and iPad QA;
- App Store screenshots, metadata, declarations, reviewer access, and support evidence;
- final Go/No-Go result and explicit submission approval.

## Candidate Acceptance Gates

The client candidate is acceptable only when:

- the exact SHA has passing required CI;
- zero high-severity production dependency findings remain;
- crash boundaries and error states pass;
- the controlled production deployment is Ready;
- signed email, bearer service routes, invalid-request rejection, Clerk protection, and cross-household isolation pass;
- all eight migrations and providers are healthy;
- retention, deletion, source cleanup, and rollback pass;
- web/native/email/provider journeys pass with fictional data;
- explicit client acceptance is recorded.

The App Review candidate additionally requires:

- immutable version 1.0.0 freeze;
- Apple owner/account gates complete;
- signed TestFlight build;
- physical iPhone and representative iPad QA;
- complete truthful App Store Connect materials;
- final Go/No-Go result of Go;
- explicit release-owner approval to submit.

## Deployment Restraint

- Keep automatic Vercel deployments disabled.
- Do not deploy documentation, isolated slices, routine PRs, metadata, EAS/TestFlight, or store work.
- Use one controlled Phase 16 deployment after preflight.
- Permit at most one final redeployment for batched executable client-acceptance blockers.
- Never redeploy unchanged code or create no-op commits for evidence.

## Rollback and Stop Conditions

If an authentication, privacy, migration, provider, dependency, crash, or acceptance gate fails:

1. stop the affected Worker, scheduler, or adapter where possible;
2. roll Vercel back to the recorded safe Ready deployment;
3. preserve production database and private objects;
4. investigate migrations on an isolated Neon branch;
5. rotate/revoke affected credentials if exposure is suspected;
6. fix through a focused reviewed PR with green exact-head CI;
7. repeat every affected regression gate.

Pause for private credentials, provider ownership/cost, physical-device testing, real client acceptance, irreversible production changes, Apple enrolment/agreements, reviewer credentials, submission approval, public-release approval, or a material product decision.

App Review submission requires explicit release-owner approval. Public release requires separate approval.
