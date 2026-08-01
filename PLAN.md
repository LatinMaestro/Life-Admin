# Family Life Admin Delivery Plan

## Objective

Deliver Family Life Admin version 1.0.0 as one evidence-linked, client-approved, signed iOS release candidate that is ready for explicit release-owner approval to submit to Apple App Review. After explicit submission approval, submit and address App Review feedback. Public release always requires a separate approval.

Development, verification, and release preparation use GitHub and hosted services only. No development, installation, or execution is required on the client's computer.

## Product Boundary

Family Life Admin is private household administration, not personal finance.

- SpendGrove remains the finance product.
- Bills and renewals are administrative reminders that return the user to the original email, PDF, link, or confirmed source image.
- Manual creation is always available.
- Automated email, upload, OCR/classification, and voice intake create reviewable drafts only.
- An authorised household member confirms every automated draft.
- Never persist, transcribe, reproduce, log, search, classify, or notify BPAY codes, BSBs, account numbers, customer reference numbers, payment references, or other structured payment identifiers.
- Raw OCR and speech text remain temporary.
- Every application record, object, draft, background operation, and notification remains household-scoped, role-authorised, idempotent, private, retained only as documented, and deletable.

## Completed Foundation

1. Phases 1–15 in `docs/PHASES_1_TO_16.md`.
2. Mobile-first Next.js household workspace and versioned household API.
3. Clerk production authentication, household scoping, roles, invitations, recovery, and lifecycle safeguards.
4. Neon PostgreSQL persistence with all eight reviewed migrations.
5. Expo iOS/Android client with secure sessions and core workflow parity.
6. Recurrence, private uploads, camera capture, forwarded email intake, bounded OCR/classification, voice drafts, notification preferences, retention, and cleanup.
7. Automated browser, API, privacy, security, native bundle, UI, accessibility, dependency, and crash-readiness checks.
8. Grovekind production domain, Android signing, and prior engineering builds.

Previous signed builds are engineering evidence only. Client and store candidates must be rebuilt from the frozen exact verified commit.

## Verified State — 1 August 2026

### Repository and integration

- Phase 16 is in progress.
- Current `main` and latest verified executable candidate: `2df917bea662f940c9c631a130baae99455b8a99`.
- No pull request is open after the complete repository review.
- Issue #70 is the sole open issue and the Phase 16-to-App-Review delivery tracker.
- Phase 16 and release branches outside `main` map to merged or deliberately closed historical pull requests; no hidden active implementation stack was found.
- GitHub Actions capacity is available again.
- PR #113 passed exact-head CI run `30207082000` and merged the service-authentication fix as `2838a9fa55ae4f22feae0390284ca899b1efbe18`.
- PR #114 passed exact-head CI run `30687110059` and merged release, privacy, permissions, reviewer, and store reconciliation as `2de83f6315839bf1e1907e6d13dc0dc369f57e5d`.
- PRs #115, #118, #119, #121, and #123 passed exact-head CI and merged evidence reconciliation without changing production.
- PR #117 passed exact-head CI run `30689423957` and merged fail-closed private-provider activation checks.
- PR #120 passed exact-head CI run `30693355367` and fixed empty source references after private-object deletion.
- PR #122 passed exact-head CI run `30695258402` and fixed terminal intake-source and inbox cleanup.
- PR #124 exact head `97c0a694b67008739885e35d493646063f73888e` passed CI run `30697413278`, had no reviews or unresolved threads, and merged dependency and crash-readiness gates as executable commit `07807e2c24b89b4420d0ffb6b33d2847e4c81fd0`.
- PR #126 exact head `f4f393be1fa2ed6c075b6be9b9c93c6d9a3104f8` passed CI run `30700645080`; mobile job `91370951769` and web/browser job `91370951748` passed every step. It merged the reproducible mobile lock and `npm ci` gate as `06144e9045b530bb21571f2e8b8bf3999b1b699b`.
- PR #127 exact head `0608038ad3bfdf2b9493b4a143fc8a38a449517a` passed CI run `30700781844`; web/browser job `91371307718` and mobile job `91371307740` passed every step. It merged two actionable moderate web patches as current `main` `2df917bea662f940c9c631a130baae99455b8a99`.
- Production audits report zero high or critical findings. Web has one residual moderate Windows-only `serveStatic` advisory in Prisma development tooling; mobile enumerates 23 affected dependency nodes that trace to one `uuid` buffer advisory in transitive Expo/Clerk tooling. Neither vulnerable API is imported or invoked by application code, and neither has a compatible upstream audit fix; both remain release-tracked rather than force-overridden.
- Web and native CI now include high-severity production dependency audits, web route/global error boundaries, and a native Expo Router error boundary.

### Neon

- Project `life-admin-production` uses PostgreSQL 17.
- Primary branch `br-square-voice-aj67a94o` is Ready.
- All 8 migrations are finished; none is rolled back.
- All 28 public tables are present.
- Applied migration SHA-256 checksums match repository migration sources.
- Branch protection is disabled.
- Restore history is six hours.
- A read-only query has demonstrated that an archived compute can resume without schema loss; cold-start timing and the intended branch lifecycle still require release-candidate acceptance evidence.

### Vercel

- Production remains intentionally unchanged on Ready deployment `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL`.
- That deployment is from old `main` commit `4233d14e4f77d096120a3d90c4b42d2928779f3d`.
- No runtime error cluster was present in the preceding 24 hours.
- The merged service-route fix, provider guard, retention fixes, dependency patches, and crash boundaries are not deployed.
- Scheduled cleanup and notification requests will continue returning 404 until the controlled candidate deployment.
- The old Ready deployment remains the current rollback target.

### Unverified live provider boundary

Direct name/value-presence attestation is still required for Clerk, private R2, Cloudflare Email Routing, Workers AI, Expo, and the Vercel production environment. Repository code and fail-closed checks do not prove dashboard configuration. Secret values must never be recorded in GitHub evidence.

## Vercel Deployment Discipline

Vercel limits are shared across the owner's projects and must be conserved.

1. Keep automatic Git deployments disabled for branches and pull requests.
2. Do not deploy documentation, routine PRs, isolated implementation slices, rebases, metadata, screenshots, EAS/TestFlight work, evidence refreshes, or unchanged code.
3. Finish every repository-only and provider-dashboard preflight gate before deploying.
4. Permit one controlled Phase 16 production deployment after the exact candidate has green CI, the complete diff is reviewed, providers are attested, all eight migrations are verified, and rollback is current.
5. Use that deployment for service authentication, provider integration, production smoke, Rivera acceptance, and the web/native client candidate.
6. If client acceptance exposes executable blockers, batch focused fixes and permit at most one final release-candidate redeployment after all fixes merge with green exact-head CI.
7. Do not create no-op commits or redeploy only to refresh evidence.
8. App Store metadata, signing, TestFlight, and App Store Connect work never trigger Vercel.
9. Public release requires separate approval even after App Review acceptance.

## Detailed Delivery Phases

### Phase 0 — Repository Recovery and Integration — Complete

Actions completed:

1. Enumerated open, draft, closed, and merged pull requests and relevant remote branches.
2. Reviewed complete diffs, reviews, threads, mergeability, and exact-head Actions evidence.
3. Recovered Actions execution after capacity reset.
4. Integrated PRs #113–#127 in dependency order.
5. Reconciled stale historical issue #70 into the current delivery tracker.
6. Confirmed no open PR or unintegrated implementation stack remains.
7. Kept Vercel untouched throughout integration.

Exit evidence: current `main` is `2df917bea662f940c9c631a130baae99455b8a99`, required CI is green, and no PR is open.

### Phase 1 — Repository and Provider Preflight — Current

Autonomous repository work:

1. Re-run exact-candidate CI and review every web/native job and release guard.
2. Confirm zero high-severity production dependency findings; evaluate moderate findings for exploitability and release impact.
3. Verify typecheck, lint, production build, Prisma validation/generation, browser smoke, native typecheck, iOS export, Android export, store metadata, payment-source guardrails, service-route tests, retention/deletion tests, and crash boundaries.
4. Audit household scoping, roles, invitations, last-admin safeguards, idempotency, notification privacy, log redaction, source lifecycle, and deletion retry behaviour.
5. Reconcile version `1.0.0`, bundle identifier `com.latinmaestro.familylifeadmin`, permission strings, background modes, support/privacy/deletion URLs, release notes, and rollback instructions.
6. Create focused PRs only for evidenced blockers; review the complete diff and merge only with green exact-head checks and resolved threads.

Read-only or reversible hosted-provider checks:

7. Reverify Neon 8/8 migrations, 28 tables, exact checksums, zero rollbacks, recovery window, branch state, and cold-start behaviour.
8. Attest Vercel production variable names and non-secret presence against the fail-closed activation guard.
9. Attest Clerk production domain, Native API, redirect/deep-link allowlists, and native app registration requirements.
10. Attest private R2 public-access denial, Grovekind-only CORS, incomplete multipart cleanup, quarantine, lifecycle, deletion, and orphan handling.
11. Attest Cloudflare Email Routing alias controls, Worker binding, signature secret presence, replay window, duplicate suppression, supported size/type limits, and revocation/rotation procedure.
12. Attest Workers AI bindings and bounded OCR/classification/voice behaviour, temporary-data deletion, failure handling, and log exclusion.
13. Attest Expo project ownership, production API/auth values, build profiles, current build capacity, and iOS simulator/Android preview readiness.
14. Attest operations scheduler endpoint names, narrow bearer-secret presence, retry/deduplication behaviour, stop controls, and observability without secret or household content.

Owner stop gate: pause only if a dashboard value, private credential, paid-plan decision, or irreversible provider action is required. Provide exact click-by-click owner steps, identify which values remain private, and state the unlocked verification.

Exit gate: all repository checks and provider attestations pass; only live production verification remains.

### Phase 2 — Controlled Production Activation

1. Freeze the deploy candidate SHA and record its green CI run.
2. Confirm the rollback deployment and database restore path immediately before activation.
3. Run the merged fail-closed production-configuration check.
4. Trigger exactly one controlled Vercel production deployment.
5. Record candidate SHA, CI run, deployment ID/URL, timestamp, domain assignment, and rollback ID.
6. Confirm `lifeadmin.grovekind.com` resolves to the new Ready deployment.
7. Verify correctly signed inbound email succeeds.
8. Verify an exact signed provider retry is acknowledged idempotently without another source, draft, or notification.
9. Verify missing, malformed, expired, altered-event, and invalid signatures are rejected without disclosure.
10. Verify valid cleanup and notification bearer requests succeed.
11. Verify missing, short, or invalid bearer requests fail.
12. Verify ordinary signed-out app and household API routes remain Clerk protected.
13. Verify lookalike/child service paths do not bypass Clerk and cross-household access fails without target disclosure.
14. Reverify migrations, provider connectivity, rollback readiness, and runtime error logs.

Exit gate: the exact candidate is Ready in production, all authentication/provider checks pass, and rollback is reproducible.

### Phase 3 — Production Web, Email, and Provider Acceptance

1. Create the fictional Rivera Household only; use no real personal or payment data.
2. Test onboarding, household setup, two households, two roles, invitations, role changes, removal, and last-admin recovery.
3. Test tasks, reminders, shopping, bills, sources, comments, activity, recurrence, and original-source return.
4. Test uploads and private download access, type/size rejection, quarantine, retention, deletion, and orphan recovery.
5. Test forwarded email, attachment handling, duplicates, unsupported content, original-source retention, and review-only draft creation.
6. Test embedded text/OCR/classification boundaries, confidence/review states, redaction, temporary cleanup, and manual fallback.
7. Test voice draft recording, denial, retry, bounded temporary processing, dismissal/expiry cleanup, and manual fallback.
8. Test opt-in notifications, quiet hours, generic previews, deep links, retry/deduplication, revocation, sign-out cleanup, and expired tokens.
9. Run public, authenticated, error, offline/retry, deletion, accessibility, and performance web journeys.
10. Record immutable request IDs, timestamps, screenshots, and provider/deployment references without secrets or household content.

Exit gate: documented production web/email/provider journeys pass with the fictional dataset.

### Phase 4 — Native Client Candidate

1. Build Android preview and iOS simulator candidates from the exact production commit.
2. Record EAS build IDs, profiles, commit SHA, dependency lock state, and artifact references.
3. Execute the documented native acceptance journey on both platforms where hosted execution permits.
4. Verify secure session storage, sign-in/out, recovery, expiry, deep links, and household isolation.
5. Verify all household workflows and recurrence.
6. Verify camera/photo upload, microphone capture, permission timing, denial/revocation, retries, and manual fallbacks.
7. Verify forwarded email and bounded OCR/classification/voice drafts through the production backend.
8. Verify notification opt-in, safe previews, deep links, token cleanup, offline/error states, accessibility, and representative tablet layout.
9. Create focused blocker PRs, merge only with green exact-head CI, batch Vercel-affecting fixes, and repeat affected gates.

Exit gate: web and native candidates from one immutable commit pass engineering acceptance.

### Phase 5 — Explicit Client Acceptance

Client actions:

1. Open the production web candidate using the supplied fictional account.
2. Install/open the provided native test candidate using the documented distribution path.
3. Complete `docs/CLIENT_TESTING.md` using only the Rivera Household.
4. Record each defect by platform, screen, action, expected result, actual result, screenshot, and severity.
5. Explicitly confirm acceptance when all release-blocking items are resolved.

Automation behaviour:

6. Continue safe repository and store-preparation work while acceptance is pending.
7. Pause the hourly task if no safe independent work remains.
8. If paused, provide exact resumption criteria.
9. Batch deployment-requiring fixes and use no more than the single permitted final redeployment.

Exit gate: explicit client acceptance is recorded and no release-blocking defect remains.

### Phase 6 — Version 1.0.0 Freeze

1. Select and record the immutable release SHA.
2. Prevent unrelated scope from entering the release.
3. Confirm version `1.0.0`, bundle identifier, build-number strategy, and supported OS/device targets.
4. Reconcile the binary with camera, photo, microphone, notification, upload, email, OCR/classification, voice, push-token, diagnostic, retention, and deletion declarations.
5. Confirm just-in-time permission prompts, denial/revocation paths, manual fallbacks, no background recording, and no remote-notification background mode.
6. Finalise support/privacy/deletion URLs, monitored support contact, release notes, reviewer notes, and rollback.
7. Complete final security, dependency, migration, deletion, accessibility, performance, crash-readiness, encryption/export, and content-rights audits.
8. Generate a freeze manifest linking Git, CI, Vercel, Neon, providers, EAS candidates, and client acceptance.

Exit gate: the release candidate is immutable and ready for Apple account operations.

### Phase 7 — Apple Release-Owner Setup — Owner Gate

The release owner must personally:

1. Enrol and verify the intended long-term Apple Developer account owner.
2. Accept current Apple legal and paid-app agreements.
3. Confirm billing and tax requirements where Apple requires them.
4. Provide only the Apple Team ID to the release workflow.
5. Create the App Store Connect app record for `com.latinmaestro.familylifeadmin`.
6. Record the numeric App Store Connect app ID privately.
7. Create or approve the least-privilege API/submission access required for the build workflow.
8. Confirm the App Review contact, monitored support contact, and recovery owner.
9. Create stable fictional reviewer credentials and place them only in App Store Connect.
10. Retain all passwords, recovery codes, identity documents, billing data, signing recovery, and legal acceptance.

Automation must pause if these actions are the only remaining dependency, explain each dashboard step, and resume only after explicit confirmation. Codex never handles identity documents, passwords, recovery codes, or agreements.

Exit gate: Apple owner/account prerequisites are explicitly confirmed.

### Phase 8 — Signed iOS Build and TestFlight

1. Create Expo-managed iOS signing credentials under the approved Apple team.
2. Register the signed native iOS configuration and required deep links with Clerk.
3. Build the signed production iOS binary from the frozen exact commit.
4. Verify entitlements, purpose strings, background modes, bundle ID, version, build number, icons, and privacy manifests.
5. Upload the exact build to TestFlight.
6. Record EAS build ID, artifact checksum/reference, Git SHA, CI run, App Store Connect build number, processing result, and tester group.
7. Resolve upload/processing blockers through focused reviewed work and rebuild from a new frozen exact commit when necessary.

Exit gate: the exact frozen build is processed and available in TestFlight.

### Phase 9 — Physical iPhone and iPad QA

1. Test on at least one current physical iPhone and a representative iPad layout.
2. Verify authentication, recovery, session restoration/expiry, onboarding, isolation, roles, invitations, and every household workflow.
3. Verify recurrence, camera/photo uploads, forwarded email, OCR/classification drafts, voice drafts, notification opt-in/deep links, offline/error/retry, and manual fallbacks.
4. Verify permissions appear only after user action and remain usable after denial/revocation.
5. Verify accessibility with Dynamic Type, VoiceOver labels/order, contrast, reduced motion where relevant, focus, and touch targets.
6. Verify startup, navigation, memory/crash symptoms, cold-start recovery, and representative network conditions.
7. Verify account/household deletion, retention, cleanup, sign-out token cleanup, and privacy disclosures.
8. Record device model, OS, build number, journey, result, and evidence.
9. Fix every blocker through reviewed PRs, rebuild, and repeat affected regression gates.

Exit gate: the exact TestFlight build passes current-iPhone and iPad QA.

### Phase 10 — App Store Connect Completion

1. Capture final fictional screenshots from the approved signed build.
2. Complete name, subtitle, promotional text, description, keywords, category, availability, and release notes.
3. Complete age rating, encryption/export compliance, content rights, and App Privacy answers from the frozen binary/provider inventory.
4. Confirm camera/photo/microphone/notification purpose strings match actual use.
5. Add stable fictional reviewer access only in App Store Connect.
6. Write deterministic review notes for authentication and every gated feature.
7. Confirm support, privacy, and account-deletion links are live and monitored.
8. Remove unsupported finance, automatic-action, offline-write, or other marketing claims.
9. Verify every screenshot, declaration, contact, and field against the frozen build.

Exit gate: every App Store Connect field and reviewer requirement is complete.

### Phase 11 — Final Go/No-Go Audit and Submission Approval

Tie together:

1. exact Git SHA and green exact-head CI;
2. controlled Vercel deployment and rollback;
3. eight migrations, Neon state, and provider health;
4. EAS signed build and TestFlight processing;
5. physical iPhone/iPad QA;
6. client acceptance;
7. screenshots, metadata, declarations, permissions, encryption, age rating, content rights, and reviewer access;
8. support, deletion, incident, retention, backup, and rollback operations.

Resolve every No-Go item. Produce a concise Go/No-Go report and stop for explicit release-owner approval to submit version 1.0.0.

Exit gate: the report is Go and the release owner explicitly approves submission.

### Phase 12 — App Review Submission and Response

Only after explicit submission approval:

1. Submit version 1.0.0 to Apple App Review.
2. Record submission timestamp, build, version, state, and immutable evidence.
3. Monitor review messages and status.
4. Classify feedback as metadata, access, compliance, or executable defect.
5. Resolve metadata issues without rebuilding when truthful and sufficient.
6. Resolve executable defects through focused reviewed PRs, a newly frozen build, affected regression QA, and resubmission.
7. Keep reviewer communication factual and avoid unsupported claims.

Exit gate: App Review accepts the version or a precise owner/material-product blocker is reported.

### Phase 13 — Separate Public Release Approval and Closeout

1. Do not release publicly on App Review acceptance alone.
2. Present the accepted build, rollout choice, support readiness, rollback, and residual risks.
3. Obtain separate explicit public-release approval.
4. Release using the owner-approved availability mode.
5. Monitor crash, support, authentication, deletion, provider, and privacy signals.
6. Roll back or pause availability if a release gate fails.
7. Tag/version immutable evidence and close issue #70 only when the Definition of Done is satisfied.

Exit gate: version 1.0.0 is approved, released as authorised, supported, and evidence-complete.

## Hourly Automation Operating Rules

Every scheduled session must:

1. Read `AGENTS.md` and every mandatory source-of-truth document before acting.
2. Inspect current `main`, all open and draft PRs, full diffs, reviews, unresolved threads, exact-head CI, relevant branches, issue #70, provider state, App Store evidence, and the latest handoff.
3. Resume the first dependency-ready phase without duplicating completed work.
4. Create focused PRs only; merge only when scope matches the source documents, the complete diff is reviewed, required exact-head checks pass, and threads are resolved.
5. Preserve the Vercel deployment discipline above.
6. Continue safe work around external gates.
7. Pause when only client, credential, paid-provider, physical-device, Apple owner, submission, public-release, or material product actions remain.
8. When pausing, provide detailed owner steps, what must remain private, evidence to return, and what the action unlocks.
9. End with a small update containing:
   - completed work and exact evidence;
   - current phase and status;
   - blockers or required owner action;
   - the next action for the following session.
10. Never commit secrets or real household data, weaken privacy, create paid accounts, accept legal terms, submit for review, or release publicly without the required approval.

## Stop Gates

Do not infer or bypass:

- real client acceptance;
- private credentials or provider ownership/cost decisions;
- physical-device testing;
- irreversible production mutations;
- Apple enrolment, identity verification, agreements, billing, or recovery;
- reviewer credentials;
- App Review submission approval;
- public release approval;
- material product decisions.
