# Family Life Admin Plan

## Objective

Deliver Family Life Admin version 1.0.0 as one evidence-linked, client-approved, signed iOS release candidate that is ready for explicit release-owner approval to submit to Apple App Review.

Development remains online-only through GitHub and hosted services. No development, installation, or execution is required on the client's computer.

## Product Boundary

Family Life Admin is private household administration, not personal finance. Bills and renewals are administrative reminders that return users to original sources. Web, API, native, email, upload, OCR, voice, background processing, and notification surfaces must never persist, transcribe, reproduce, log, or notify structured payment identifiers.

SpendGrove remains the finance product. Automated intake creates reviewable drafts only; an authorised household member confirms them, and manual creation remains available.

## Completed Foundation

1. Phases 1-15 in docs/PHASES_1_TO_16.md.
2. Mobile-first Next.js household workspace and versioned household API.
3. Clerk production authentication, household scoping, roles, invitations, and lifecycle safeguards.
4. Neon PostgreSQL persistence and all eight reviewed migrations.
5. Expo iOS/Android client with secure sessions and core workflow parity.
6. Recurrence, private uploads, camera capture, forwarded email intake, bounded OCR/classification, voice drafts, notification preferences, retention, and cleanup implementation.
7. Automated browser, API, privacy, security, native bundle, UI, and accessibility checks.
8. Grovekind production domain, Android signing, and prior engineering builds.

Previous signed builds are engineering evidence only. Client and store candidates must be rebuilt from the frozen exact verified commit.

## Verified State — 1 August 2026

- Phase 16 is in progress.
- Main remains 4233d14e4f77d096120a3d90c4b42d2928779f3d.
- PR #113, Fix service-authenticated production routes, remains the first dependency at e145e21873a34702a880984bb1e24c7b6181dcc9.
- PR #113 is mergeable and has no unresolved review threads.
- GitHub Actions run 30207082000, its pre-reset retry, and one post-reset same-head retry all failed before either job executed. The post-reset attempt created Web quality and build job 90914167953 and Mobile typecheck job 90914167959; both have zero steps and their log downloads return BlobNotFound/404. This is still not valid exact-head verification and is not evidence of a source failure.
- The post-reset retry was accepted after 01:00 Australia/Brisbane on 31 July 2026 but execution capacity did not become available. Do not merge, create a no-op commit, or consume repeated retries. Retry the immutable head only after GitHub Actions capacity is confirmed.
- Draft PR #114, Reconcile store privacy and release handoff, is stacked on #113 and contains the corrected feature, privacy, permission, provider-activation, reviewer, checklist, store-metadata, and App Review delivery plan.
- Its mandatory-source audit now also reconciles the implemented production data model and review gates: onboarding, private source assets, recurrence, intake drafts, voice, device installations, and notifications are implemented rather than deferred proposals.
- Exactly two pull requests are open: #113 and #114. Neither has reviews or unresolved inline review threads.
- The repository has 114 remote branch names. The Phase 16 and release branches outside #113/#114 map to merged or deliberately closed historical pull requests; no additional active implementation stack was identified.
- The only open issue is #70. Its older pre-store feature checkboxes and release wording are stale against the merged Phase 1-15 implementation and the #114 documents. Reconcile it after #114 lands; do not use its unchecked historical list as the current build backlog.
- Vercel production deployment dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL is Ready on main 4233d14e4f77d096120a3d90c4b42d2928779f3d.
- Production runtime evidence shows scheduled cleanup and notification requests returning 404 because current main's Clerk middleware intercepts their route-level authentication. PR #113 is the scoped fix.
- Neon production uses PostgreSQL 17 and all eight reviewed migrations. Branch protection remains disabled and restore history is six hours; the pre-launch protection/retention decision remains open.
- On 1 August 2026 the production main branch was observed archived after inactivity; a read-only schema query restored it to Ready with the read/write compute active, 8/8 migrations applied, and 28 public tables intact. Record cold-start/recovery timing during the controlled candidate and confirm the intended branch lifecycle before release.

## Deployment Discipline

Vercel deployment limits are shared across the owner's projects and must be conserved.

1. Keep automatic Vercel Git deployments disabled for branches and pull requests.
2. Do not deploy for documentation, isolated implementation slices, routine CI, rebases, metadata work, or intermediate merges.
3. Complete and merge all repository-only work that can be verified without production deployment first.
4. Permit one controlled Phase 16 production deployment only after:
   - PR #113 and PR #114 are merged in dependency order;
   - exact-head required checks pass;
   - the combined main diff is reviewed;
   - provider configuration is ready for production verification;
   - migration and rollback evidence is current.
5. Use that deployment for route authentication, provider integration, production smoke, fictional-data acceptance, and client-candidate evidence.
6. If client acceptance finds release blockers, batch focused fixes, verify them in GitHub, and perform at most one final release-candidate deployment after the fixes are consolidated.
7. Do not redeploy unchanged code, use no-op commits, or deploy only to obtain a fresh timestamp.
8. App Store metadata, signing, EAS builds, TestFlight, and store-console work must not trigger Vercel.
9. Public release requires separate approval even after App Review acceptance.

## Delivery Plan To App Review Readiness

### Milestone 1 — Integration Recovery

1. Confirm GitHub Actions execution capacity, then execute CI once on the immutable PR #113 head. The first post-reset retry still failed before execution, so do not consume repeated retries or create a no-op commit.
2. Inspect real job steps and logs once a job actually starts. Fix only evidenced source failures in a focused commit; do not weaken checks.
3. Review the complete #113 diff, confirm no unresolved threads, and merge only when exact-head required checks pass.
4. Verify the resulting main commit without triggering Vercel.
5. Retarget or rebase draft PR #114 onto verified main so its diff contains only the eleven intended documentation and store-metadata files.
6. Re-run its document/metadata checks and required exact-head CI, review the final diff, mark ready, and merge.
7. Keep Vercel paused throughout this milestone.

Exit gate: #113 and #114 are merged in order, required exact-head checks pass, main is verified, and no Vercel deployment was consumed.

### Milestone 2 — Pre-Deployment Production Readiness

1. Reconcile Clerk, Neon, Cloudflare R2, Email Routing, Workers AI, Expo, and Vercel environment configuration without exposing secret values.
2. Re-verify all eight migration records and repository checksums.
3. Confirm private R2 access, bucket policy, CORS, lifecycle cleanup, quarantine, deletion, and orphan handling.
4. Confirm signed inbound-email configuration, duplicate protection, size/type controls, original-source retention, and rotation/revocation paths.
5. Confirm OCR/classification and voice adapters remain bounded, review-first, redacted, temporary, and excluded from logs.
6. Confirm notification preferences, token lifecycle, quiet hours, generic previews, deep links, retries, deduplication, and sign-out cleanup.
7. Confirm cleanup and notification schedulers use narrow bearer authentication and can be stopped independently.
8. Complete repository-level security, privacy, dependency, migration, deletion, accessibility, performance, and crash-readiness checks that do not require production deployment.
9. Review rollback targets and ensure the previous Ready Vercel deployment remains available.

Exit gate: all safe pre-deployment evidence passes and only live production verification remains.

### Milestone 3 — Consolidated Phase 16 Deployment

1. Deploy the exact verified main commit once through a controlled production action.
2. Record the Git commit, CI run, Vercel deployment ID, production URL, timestamp, and rollback deployment.
3. Prove with non-secret evidence:
   - correctly signed inbound email succeeds;
   - unsigned, malformed, replayed, or invalid-signature email fails;
   - valid maintenance and notification bearer requests succeed;
   - missing or invalid bearer requests fail;
   - ordinary app and household API routes remain Clerk protected.
4. Verify all eight migrations, private R2, email intake, OCR/classification, voice, notifications, retention, cleanup, deletion, and provider failure/retry behaviour with fictional data.
5. Run production web smoke tests and the documented web acceptance journey.
6. Create the fictional Rivera Household data set with no real personal or payment data.
7. Produce current Android preview and iOS simulator candidates from the same exact commit.
8. Run the documented native and email acceptance journeys and record immutable evidence.

Exit gate: one exact commit has passing CI, a Ready controlled production deployment, passing provider and web/native acceptance evidence, and reproducible rollback.

### Milestone 4 — Client Acceptance

1. Provide the production web candidate and native test candidate with the concise checklist in docs/CLIENT_TESTING.md.
2. Obtain explicit client confirmation for the UI and complete workflow.
3. Record feedback by screen and action using fictional data only.
4. Resolve every release blocker through focused reviewed PRs with exact-head checks.
5. Batch fixes before any additional Vercel deployment.
6. If executable fixes changed the candidate, perform one final controlled deployment and repeat affected production, provider, web, and native regression gates.
7. Obtain explicit acceptance of the corrected candidate.

Exit gate: explicit client acceptance is recorded and no release-blocking defect remains.

### Milestone 5 — Freeze Version 1.0.0

1. Freeze the exact Git commit and prevent unrelated scope from entering the release.
2. Confirm version 1.0.0 and bundle identifier com.latinmaestro.familylifeadmin.
3. Confirm support, privacy, and account-deletion URLs and the monitored support contact.
4. Reconcile camera/photo, microphone, notification, upload, email, OCR/classification, voice, push-token, diagnostic, retention, and deletion declarations against the frozen binary and final providers.
5. Confirm just-in-time permission prompts, denial/revocation paths, manual fallbacks, background recording disabled, and remote-notification background mode disabled.
6. Complete security, dependency, migration, deletion, accessibility, performance, crash-readiness, encryption/export, content-rights, and rollback audits.
7. Finalise release notes, listing copy, reviewer notes, fictional screenshots plan, availability, category, and age-rating evidence.

Exit gate: the release candidate is immutable, internally approved, documented, and ready for Apple account operations.

### Milestone 6 — Apple Owner Boundary

The release owner must personally:

1. enrol and verify the intended long-term Apple Developer owner;
2. accept current legal agreements;
3. provide the Apple Team ID without sharing account credentials;
4. create the App Store Connect app record for com.latinmaestro.familylifeadmin;
5. record the numeric App Store Connect app ID privately;
6. create or approve API/submission access;
7. supply support and App Review contact details;
8. create stable fictional reviewer credentials only in App Store Connect;
9. retain password, recovery, billing, legal, and identity-document control.

Exit gate: every necessary owner action is explicitly confirmed; no password, recovery code, identity document, or agreement is handled by Codex.

### Milestone 7 — Signing, TestFlight, And Physical QA

1. Create Expo-managed iOS signing credentials under the approved Apple team.
2. Register the signed native iOS configuration with Clerk.
3. Produce the signed iOS production build from the frozen exact commit.
4. Upload that build to TestFlight and record EAS build, Git commit, bundle version, App Store Connect build number, and upload evidence.
5. Test on at least one current physical iPhone and a representative iPad layout.
6. Verify authentication/recovery, onboarding, household isolation, roles, invitations, every household workflow, recurrence, camera/uploads, forwarded email, OCR/classification drafts, voice drafts, opt-in notifications/deep links, offline/error/retry states, accessibility, account/household deletion, and privacy retention.
7. Resolve every blocker through focused reviewed PRs, rebuild from a new exact verified commit, and repeat affected gates.

Exit gate: the exact TestFlight build passes physical-device and regression QA with immutable evidence.

### Milestone 8 — App Store Connect Completion

1. Capture final fictional screenshots from the approved signed build.
2. Complete listing copy, category, availability, age rating, encryption/export compliance, App Privacy, permission-purpose strings, content rights, and review notes.
3. Confirm all claims match the frozen build and no finance, automatic-action, offline-write, or other unsupported claim appears.
4. Confirm reviewer access is stable and credentials exist only in App Store Connect.
5. Confirm support, privacy, and account-deletion links are live and monitored.
6. Confirm App Review can deterministically inspect every gated feature or has truthful limitation notes and fictional test paths.

Exit gate: every App Store Connect field, screenshot, declaration, contact, and reviewer-access requirement is complete.

### Milestone 9 — Final Submission Audit

Tie together:

- exact Git commit and passing exact-head CI;
- controlled Vercel production deployment and rollback;
- all eight migrations and provider health;
- EAS signed build and TestFlight result;
- physical iPhone and iPad QA;
- screenshots, listing, declarations, permissions, encryption, age rating, content rights, and reviewer access;
- support, deletion, incident, retention, backup, and rollback operations;
- explicit client acceptance.

Produce a concise go/no-go report. Resolve every No-Go item. Stop for explicit release-owner approval before submitting version 1.0.0 to Apple App Review.

Exit gate: all checklist items are evidenced, the report is Go, and the only remaining action is the owner's explicit submission approval.

## Owner-Only And Stop Gates

Do not infer or bypass:

- real client acceptance;
- Apple enrolment, identity verification, agreements, billing, or recovery;
- reviewer credentials;
- production secrets or paid-provider decisions;
- physical-device testing;
- irreversible production changes;
- App Review submission approval;
- public release approval.

After explicit App Review submission approval, submit version 1.0.0, record the review state, address Apple feedback through scoped verified work, and never release publicly without separate approval.
