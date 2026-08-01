# Release Candidate

## Candidate Boundary

This document controls the single Phase 16 client-testing candidate. It is not an App Store or Google Play release.

The candidate includes the household workspace, recurrence, private source uploads, camera capture, forwarded email, bounded OCR and classification, voice drafts, notification preferences, lifecycle recovery, and household-scoped web/native clients.

It never includes banking, budgeting, transaction tracking, spend analysis, cashflow, tax, property, loans, payment execution, or structured payment identifiers. Automated intake creates reviewable drafts only; an authorised household member confirms them, and manual creation remains available.

## Release Components

- Web: Next.js production deployment at https://lifeadmin.grovekind.com
- API: versioned household API on the same origin
- Authentication: Clerk production instance and custom Grovekind domain
- Database: Neon PostgreSQL 17 with all eight reviewed migrations
- Android: EAS internal preview candidate
- iOS: EAS simulator candidate before Apple enrolment, then signed production/TestFlight build after owner gates
- Storage: private Cloudflare R2 with public access disabled
- Email: signed inbound Email Worker
- Document and speech processing: narrowly scoped provider credentials and bounded processing
- Notifications: explicit opt-in preference and registration flow
- Operations: bearer-authenticated cleanup and notification dispatch endpoints

## Verified State — 31 July 2026

- Main commit: 4233d14e4f77d096120a3d90c4b42d2928779f3d
- Vercel production deployment: dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL, Ready on that main commit
- Open route-boundary fix: PR #113 at e145e21873a34702a880984bb1e24c7b6181dcc9
- PR #113 review state: mergeable, no unresolved review threads
- Exact-head CI: run 30207082000, its pre-reset retry, and one post-reset same-head retry all failed before either job executed. The post-reset jobs 90914167953 and 90914167959 had zero steps and log downloads returned BlobNotFound/404, so this remains an Actions execution-capacity failure rather than valid source verification
- Hosted Node 24 security-boundary test at PR head: 5 of 5 passing
- Production runtime: scheduled requests are reaching cleanup and notification paths, but current main returns 404 because Clerk middleware intercepts the service routes
- Neon: production project PostgreSQL 17 directly reverified on 31 July 2026 with all eight migration records finished and not rolled back and all 13 required release tables present; branch protection disabled; restore history six hours
- Privacy documentation: staged reconciliation on release/reconcile-store-privacy-v1 because earlier store documents incorrectly described implemented intake permissions and data flows as absent

PR #113 must not merge until exact-head required checks execute and pass. Do not create a no-op commit or consume repeated retries while Actions execution capacity remains unavailable. The documentation branch is stacked on its exact head and must be rebased or retargeted after #113 lands.

## Controlled Activation

1. Obtain a valid exact-head CI run for PR #113.
2. Review the final diff and merge only with passing required checks.
3. Deploy the exact verified main candidate.
4. Verify the Grovekind domain resolves to that Ready deployment.
5. Prove:
   - correctly signed inbound email succeeds;
   - unsigned or invalid inbound email fails;
   - valid maintenance and notification bearer requests succeed;
   - missing or invalid bearer requests fail;
   - ordinary app and household API routes remain Clerk protected.
6. Verify all eight migrations and provider configuration without exposing secrets.
7. Run fictional-data checks for private R2, email intake, OCR/classification, voice, notifications, retention, and cleanup.
8. Run production web smoke and documented acceptance journeys.
9. Create the fictional Rivera Household data set.
10. Build one Android preview and one iOS simulator candidate from the same exact verified commit.
11. Record immutable commit, CI, deployment, migration, provider, and EAS evidence.
12. Obtain explicit client acceptance before freezing the store candidate.

## Immutable Evidence

- Approved client-candidate Git commit: pending exact-head CI and activation
- GitHub CI run: pending a valid exact-head run
- Vercel deployment: current Ready main deployment recorded above; final candidate deployment pending
- Migration state: all eight reviewed migrations recorded; final candidate re-verification pending
- Android preview: earlier builds are engineering evidence only; final candidate pending
- iOS simulator: pending
- Production provider acceptance: pending fictional-data verification
- Client acceptance: pending explicit confirmation

## Provider Readiness

Evidence recorded so far:

- Clerk production and Grovekind domain are configured.
- Neon production PostgreSQL 17 is healthy and the eight migrations have been reviewed.
- Neon protection and longer-retention decision remains open.
- Cloudflare R2 is intended to remain private, with Grovekind PUT-only CORS and incomplete multipart cleanup.
- Production runtime evidence proves the operations scheduler is active, but it currently receives 404 from main.
- Direct final-state verification remains required for R2 credentials, Email Routing, signed worker secrets, Workers AI scopes, provider logs, retention, and deletion.
- Apple account, iOS signing, APNs, TestFlight, reviewer credentials, physical-device QA, and submission are owner-gated.

No secret value belongs in this document.

## Store Freeze After Client Acceptance

The frozen version 1.0.0 evidence must confirm:

- bundle identifier com.latinmaestro.familylifeadmin;
- support, privacy and account-deletion URLs;
- release notes and rollback plan;
- privacy declarations covering camera/photo sources, private files, forwarded email, OCR/classification drafts, voice audio/speech processing, push tokens, notifications, and deletion;
- just-in-time permission prompts and usable denial/revocation paths;
- security, dependencies, migrations, accessibility, performance, crash readiness, and retention;
- signed TestFlight build from the exact frozen commit;
- current iPhone and representative iPad QA.

## Rollback

If the candidate fails a privacy, access, migration, or provider gate:

1. stop the affected Worker or scheduler;
2. roll Vercel back to the previous Ready deployment;
3. preserve production records and investigate on an isolated Neon branch;
4. revoke affected provider credentials;
5. rerun privacy, payment-source, authorisation, migration, deletion, and release journeys before reactivation.

App Review submission requires explicit release-owner approval. Public release requires separate approval.
