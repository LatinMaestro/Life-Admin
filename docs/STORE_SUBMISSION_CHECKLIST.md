# Store Submission Checklist

This checklist separates completed repository work from release-owner steps that require external accounts, production credentials, signed builds, or physical devices. A checked repository item records implemented and verified configuration, not App Store approval or final-build QA.

## Repository Integration

- [x] Phases 1–15 are complete.
- [x] Review all open and draft PRs, relevant branches, complete diffs, reviews, threads, and exact-head CI after Actions capacity returned.
- [x] Merge the service-authentication fix in PR #113 after passing exact-head CI.
- [x] Merge the release/privacy/store reconciliation in PR #114 after passing exact-head CI.
- [x] Merge the fail-closed live-provider activation gate in PR #117.
- [x] Merge private-object and terminal intake-source cleanup fixes in PRs #120 and #122.
- [x] Merge dependency and crash-readiness gates in PR #124.
- [x] Merge the reproducible mobile lock and `npm ci` gate in PR #126.
- [x] Merge actionable moderate web dependency patches in PR #127.
- [x] Confirm no open PR or unintegrated implementation stack remains.
- [x] Reconcile issue #70 to current delivery truth.
- [x] Record current verified executable `main`: `2df917bea662f940c9c631a130baae99455b8a99`.
- [x] Keep Vercel untouched during repository integration.

## Repository Release Gates

- [x] iOS and Android identifiers are stable.
- [x] Version 1.0.0 and native build numbers are configured.
- [x] EAS preview, production, and submission profiles are present.
- [x] App icon, Android adaptive/monochrome icon, and splash artwork are configured.
- [x] Camera, photo-library, and microphone purpose strings are configured for optional user-initiated capture.
- [x] Background audio recording is disabled.
- [x] Notification support is explicit opt-in; remote-notification background mode is disabled.
- [x] Native typecheck, iOS export, Android export, and structural release checks run in CI.
- [x] Web lint, typecheck, production build, browser smoke, privacy/security guardrails, and API tests run in CI.
- [x] High-severity production dependency audits run for web and native.
- [x] PR #124 reduced production dependency findings to zero high-severity findings.
- [x] PR #126 committed the exact mobile dependency graph and verified `npm ci`, store checks, and iOS/Android exports.
- [x] PR #127 patched two actionable web moderate advisories; one Windows-only Hono advisory remains in Prisma development tooling.
- [x] Record the mobile residual: 23 moderate dependency nodes trace to one transitive `uuid` advisory in Expo/Clerk tooling; application code uses Expo Crypto instead and does not invoke the vulnerable API.
- [x] Web route/global error boundaries and the Expo Router error boundary are implemented.
- [x] Privacy, support, and account-deletion pages exist.
- [x] Account deletion has last-admin and household ownership safeguards.
- [x] Native password recovery uses Clerk's email-code flow.
- [x] Store listing copy, machine-readable Apple metadata, and reviewer guidance are documented and checked in CI.
- [x] Bill/payment source-of-truth guardrails remain enforced.
- [ ] Re-run all release gates on the final frozen exact commit.
- [ ] Reconcile privacy declarations and reviewer guidance against the frozen binary and final provider settings.
- [ ] Confirm every permission prompt is user-initiated and has usable denial, revocation, retry, and manual fallback paths.
- [ ] Complete final accessibility, performance, cold-start, and crash-readiness acceptance on the signed build.

## Neon Production

- [x] PostgreSQL 17 production project exists.
- [x] All eight Prisma migrations are applied.
- [x] All eight applied migration SHA-256 checksums match repository migration files.
- [x] All migration records are finished and none is rolled back.
- [x] All 28 public tables are present.
- [x] Primary branch `br-square-voice-aj67a94o` is Ready.
- [x] Record current restore history of six hours and disabled branch protection.
- [x] Demonstrate read-only wake from archived compute without schema loss.
- [ ] Record release-candidate cold-start timing and expected branch lifecycle.
- [ ] Decide whether to purchase/enable branch protection and longer restore history before public launch.
- [ ] Reverify migration, checksum, table, rollback, and recovery evidence immediately before controlled deployment and final submission.

## Provider Preflight

- [x] Clerk production keys, custom domain, and Native API are implemented.
- [x] Mobile production API URL and Clerk publishable key are supported in EAS.
- [x] Fail-closed live-mode checks cover private R2, Workers AI, signed email, and operations configuration.
- [ ] Attest Clerk production domain, redirect/deep-link allowlists, native registration requirements, and variable-name/value presence without exposing values.
- [ ] Attest private R2 public-access denial, Grovekind CORS, multipart cleanup, quarantine, lifecycle, deletion, and orphan handling.
- [ ] Attest Cloudflare Email Routing alias, Worker binding, signature-secret presence, replay window, duplicate suppression, limits, and rotation/revocation procedure.
- [ ] Attest Workers AI bindings and bounded OCR/classification/voice processing, temporary-data cleanup, failure handling, and log redaction.
- [ ] Attest Expo ownership, production environment names, build profiles, and current build capacity.
- [ ] Attest Vercel production environment names/value presence against the activation guard.
- [ ] Attest cleanup/notification scheduler endpoints, narrow bearer-secret presence, retry/deduplication, stop controls, and content-safe observability.
- [ ] Keep all secret values out of GitHub evidence.

## Controlled Vercel Deployment

- [x] Current production remains Ready on rollback candidate `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL`.
- [x] Confirm the current production deployment is old commit `4233d14e4f77d096120a3d90c4b42d2928779f3d`.
- [x] Confirm no runtime error cluster in the preceding 24 hours.
- [x] Keep automatic Git deployments disabled for branches and PRs.
- [ ] Complete all repository/provider preflight before deployment.
- [ ] Record exact candidate SHA, green CI run, migration state, provider attestation, and rollback.
- [ ] Execute one controlled production deployment.
- [ ] Record Vercel deployment ID, URL, timestamp, domain assignment, and rollback evidence.
- [ ] Verify signed email success and exact duplicate suppression.
- [ ] Verify missing, malformed, expired, altered-event, and invalid signatures are rejected.
- [ ] Verify valid cleanup and notification bearer routes succeed.
- [ ] Verify missing, short, or invalid bearer requests fail.
- [ ] Verify ordinary routes remain Clerk protected and lookalike/child paths do not bypass Clerk.
- [ ] Verify cross-household access fails without disclosure.
- [ ] Verify migrations, providers, production web smoke, logs, and rollback.
- [ ] Permit at most one additional Vercel deployment only for batched executable client-acceptance blockers.

## Rivera Production Acceptance

- [ ] Create the fictional Rivera Household with no real personal data or payment identifiers.
- [ ] Verify onboarding, two households, two roles, invitations, role changes, removal, and last-admin recovery.
- [ ] Verify tasks, reminders, shopping, bills, sources, comments, activity, and recurrence.
- [ ] Verify uploads/private access, rejection, quarantine, retention, deletion, and orphan recovery.
- [ ] Verify forwarded email, attachments, duplicates, limits, original-source retention, and review-only drafts.
- [ ] Verify bounded OCR/classification and voice drafts, redaction, temporary cleanup, dismissal/expiry, and manual fallback.
- [ ] Verify opt-in notifications, quiet hours, generic previews, deep links, retry/deduplication, revocation, and sign-out cleanup.
- [ ] Complete public, authenticated, error, offline/retry, deletion, accessibility, and performance web journeys.
- [ ] Record immutable non-secret evidence.

## Native Candidate

- [ ] Build current Android preview and iOS simulator candidates from the exact production commit.
- [ ] Record EAS build IDs, profiles, commit SHA, lock state, and artifact references.
- [ ] Execute the documented native acceptance journey.
- [ ] Verify secure sessions, sign-in/out, recovery, expiry, deep links, and household isolation.
- [ ] Verify all household workflows, recurrence, camera/photo upload, microphone capture, and manual fallbacks.
- [ ] Verify forwarded email, OCR/classification/voice drafts, notifications, offline/error states, accessibility, and representative tablet layout.
- [ ] Resolve blockers through focused reviewed PRs and repeat affected gates.

## Explicit Client Acceptance

- [ ] Provide the production web and native candidates with `docs/CLIENT_TESTING.md`.
- [ ] Obtain client testing using only the Rivera Household.
- [ ] Record defects by platform, screen, action, expected/actual result, evidence, and severity.
- [ ] Resolve every release-blocking defect.
- [ ] Batch all Vercel-requiring fixes.
- [ ] Obtain explicit acceptance of the corrected candidate.
- [ ] Pause the hourly automation with exact owner steps if no safe independent work remains.

## Version 1.0.0 Freeze

- [ ] Freeze the exact release SHA and exclude unrelated scope.
- [ ] Confirm `1.0.0`, `com.latinmaestro.familylifeadmin`, build-number strategy, and supported targets.
- [ ] Reconcile binary permissions/privacy, provider inventory, retention/deletion, and App Privacy declarations.
- [ ] Confirm support, privacy, and deletion URLs plus monitored support contact.
- [ ] Complete final security, dependency, migration, deletion, accessibility, performance, crash, encryption/export, content-rights, and rollback audits.
- [ ] Finalise release notes, listing, reviewer notes, screenshot plan, category, availability, and age rating.
- [ ] Create a freeze manifest linking Git, CI, Vercel, Neon, providers, EAS candidates, and client acceptance.

## Apple Owner Actions

- [ ] Enrol and verify the long-term Apple Developer owner.
- [ ] Accept current Apple legal agreements.
- [ ] Complete owner-controlled billing/tax requirements where required.
- [ ] Provide only the Apple Team ID to the release workflow.
- [ ] Create the App Store Connect record for `com.latinmaestro.familylifeadmin`.
- [ ] Record the numeric App Store Connect app ID privately.
- [ ] Create/approve least-privilege API or submission access.
- [ ] Confirm App Review contact, monitored support contact, and recovery owner.
- [ ] Create stable fictional reviewer credentials only in App Store Connect.
- [ ] Keep passwords, recovery codes, identity documents, billing data, legal acceptance, signing recovery, and secrets under owner control.

## Signed Build and TestFlight

- [ ] Create Expo-managed iOS signing credentials under the approved team.
- [ ] Register signed native iOS configuration and deep links with Clerk.
- [ ] Build the signed production binary from the frozen commit.
- [ ] Verify entitlements, purpose strings, privacy manifests, background modes, bundle ID, version, build number, and artwork.
- [ ] Upload the exact build to TestFlight.
- [ ] Record Git SHA, CI, EAS build ID, artifact reference, App Store Connect build number, processing result, and tester group.

## Physical iPhone and iPad QA

- [ ] Test on a current physical iPhone.
- [ ] Test a representative iPad layout.
- [ ] Verify authentication/recovery/session lifecycle, onboarding, isolation, roles, invitations, and all household workflows.
- [ ] Verify recurrence, camera/photo, email, OCR/classification, voice, notifications/deep links, offline/error/retry, and manual fallbacks.
- [ ] Verify user-initiated permissions, denial/revocation, and accessibility.
- [ ] Verify startup, navigation, memory/crash symptoms, network transitions, and cold-start recovery.
- [ ] Verify account/household deletion, retention, cleanup, and token cleanup.
- [ ] Record device, OS, build, journey, result, and evidence.
- [ ] Rebuild and repeat affected gates after every release-blocking fix.

## App Store Connect Materials

- [ ] Capture final fictional screenshots from the approved signed build.
- [ ] Complete listing, category, availability, release notes, and keywords.
- [ ] Complete age rating, encryption/export compliance, content rights, and App Privacy.
- [ ] Confirm permission purpose strings match actual use.
- [ ] Add stable fictional reviewer access only in App Store Connect.
- [ ] Supply deterministic reviewer notes for every gated feature.
- [ ] Confirm live and monitored support/privacy/deletion links.
- [ ] Remove unsupported finance, automatic-action, offline-write, or other claims.
- [ ] Verify every field and screenshot against the frozen build.

## Submission and Release

- [ ] Tie together Git, CI, controlled Vercel deployment, rollback, migrations, providers, EAS/TestFlight, device QA, client acceptance, metadata, reviewer access, and support evidence.
- [ ] Present a final Go/No-Go report.
- [ ] Obtain explicit release-owner approval to submit version 1.0.0.
- [ ] Submit only after that approval.
- [ ] Record App Review state and feedback.
- [ ] Resolve metadata or executable issues through appropriately scoped, reviewed work and resubmit when required.
- [ ] Obtain separate explicit approval before public release.
- [ ] Monitor support, crash, authentication, deletion, provider, and privacy signals after release.
- [ ] Close issue #70 only when `docs/DEFINITION_OF_DONE.md` is satisfied.

The app is ready for App Review only when every applicable repository, provider, client, owner, physical-QA, privacy, metadata, and approval gate above is complete.
