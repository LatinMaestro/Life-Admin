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
- The latest verified executable candidate is current main 5dd94fdf5512abc83c96f824446e205d632f2d94 after the reviewed provider guard, private-object cleanup, and terminal intake-source lifecycle fixes.
- PR #113 exact head e145e21873a34702a880984bb1e24c7b6181dcc9 passed CI run 30207082000. Web/browser job 91330296765 and native job 91330296759 passed every configured step; the PR had no reviews or unresolved threads and was squash-merged as 2838a9fa55ae4f22feae0390284ca899b1efbe18.
- PR #114 exact head f489e6887f5e9fbe53d78c2afa825aaad43985ed passed CI run 30687110059. Its eleven-file documentation and store-metadata diff had no reviews or unresolved threads and was squash-merged as 2de83f6315839bf1e1907e6d13dc0dc369f57e5d.
- PR #115 exact head b8f8a2ef5a1a0adf1a5b2ca053d00f3b44b272d2 passed CI run 30689204206 and merged the post-integration release evidence as 9d16c320a921fadf3be2d4ba3527babea5e78ae4.
- PR #117 exact head 6577b816eb62557ee016ddc3edc2380b795d2ccc passed CI run 30689423957, including the new production activation regression suite, and merged as f042dd1baaf3e4db5d336c5d7605110fd3153573.
- PR #118 exact head e19d6677098c9689f7e7a8092fbb9d0670c8fb14 passed CI run 30689584408 and merged plan/checklist evidence as afa4724ba044250b017ae53029a7eb30d6534ec7.
- PR #119 exact head b7a1f3794c1e45c97eaf41614a8a0b21a1e827c4 passed CI run 30691259456 and merged exact production migration checksum evidence as fe92382b62c05fc2b0d239fae951adecdab54f54.
- PR #120 exact head e8b622416294c959ac966e63a41f6c21fcb2c63f passed CI run 30693355367 and merged empty-source orphan prevention after private-object cleanup as 01348c0f0f3389145430e8883d8aaa3523f321c7.
- PR #121 exact head 42f64c66dd8f574aaaae0c32edd534f7e91ff919 passed CI run 30693496670 and merged candidate evidence plus exact signed-email retry semantics as 597744c45f09b64276d9c789b83a936b1170633b.
- PR #122 exact head 08dc9f2398e26ffc2adddacc499b6a7dd964880f passed CI run 30695258402, had no reviews or unresolved threads, and merged terminal intake-source and inbox cleanup as 5dd94fdf5512abc83c96f824446e205d632f2d94.
- Clerk/Prisma live builds now fail closed unless the approved private R2, Cloudflare AI, signed-email, and operations configuration is present and internally consistent.
- No pull request is open. Phase 16 and release branches outside main map to merged or deliberately closed historical pull requests; no additional active implementation stack was identified.
- Issue #70 is the sole open issue and now tracks the current Phase 16-to-App-Review delivery sequence. Its obsolete feature-building backlog has been removed.
- Vercel production remains unchanged on Ready deployment dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL at old main 4233d14e4f77d096120a3d90c4b42d2928779f3d.
- Production scheduled cleanup and notification requests will continue returning 404 until the controlled candidate deploys merged main. Do not deploy before provider and repository preflight are complete.
- Neon production uses PostgreSQL 17 with all eight reviewed migrations and 28 public tables. Branch protection remains disabled and restore history is six hours.
- On 1 August 2026, the SHA-256 checksum of every applied `_prisma_migrations` record matched its corresponding `migration.sql` at repository state afa4724ba044250b017ae53029a7eb30d6534ec7; all eight records were finished and none was rolled back.
- On 1 August 2026 the inactive Neon main branch was observed archived; a read-only schema query restored it to Ready with the read/write compute active and no schema loss. Record cold-start/recovery timing during the controlled candidate and confirm the intended branch lifecycle before release.

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

### Milestone 1 — Integration Recovery — Complete 1 August 2026

1. PR #113 passed exact-head CI and merged as 2838a9fa55ae4f22feae0390284ca899b1efbe18.
2. PR #114 was recomposed onto verified main, limited to its intended eleven files, passed exact-head CI, and merged as 2de83f6315839bf1e1907e6d13dc0dc369f57e5d.
3. The resulting main commit and complete integration history were verified without triggering Vercel.
4. Issue #70 was reconciled to merged repository truth and retained as the external release tracker.
5. No other open pull request or active implementation stack precedes provider preflight.

Exit gate: passed. Continue at Milestone 2 without consuming a Vercel deployment.

### Milestone 2 — Pre-Deployment Production Readiness

1. Reconcile Clerk, Neon, Cloudflare R2, Email Routing, Workers AI, Expo, and Vercel environment configuration without exposing secret values. The merged live-mode activation guard must pass before the controlled deployment.
2. Re-verify all eight migration records and repository checksums. Completed 1 August 2026: 8/8 exact SHA-256 checksums match repository state afa4724ba044250b017ae53029a7eb30d6534ec7, with no rollback records.
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
