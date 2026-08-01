# Store Submission Checklist

This checklist separates completed repository work from release-owner steps that require external accounts, production credentials, signed builds, or physical devices. A checked repository item records implemented configuration, not store approval or final-build QA.

## Repository Gates

- [x] iOS and Android app identifiers are stable.
- [x] Version 1.0.0 and native build numbers are configured.
- [x] EAS preview, production, and submission profiles are present.
- [x] App icon, Android adaptive/monochrome icon, and splash artwork are configured.
- [x] Camera, photo-library, and microphone purpose strings are configured for optional user-initiated capture.
- [x] Background audio recording is disabled.
- [x] Notification support is configured for explicit opt-in; remote-notification background mode is disabled.
- [x] Native typecheck and structural release checks run in CI.
- [x] Privacy, support, and account-deletion pages exist in the web app.
- [x] Account deletion has last-admin and household ownership safeguards.
- [x] Native password recovery uses Clerk's email-code flow.
- [x] Store listing copy and reviewer guidance are documented.
- [x] Machine-readable Apple metadata is configured and checked in CI.
- [x] Bill/payment source-of-truth guardrails remain enforced.
- [ ] Reconcile privacy declarations and reviewer guidance against the frozen production build and final provider settings.
- [ ] Confirm every permission prompt is triggered only by a clear user action and has a usable denial/revocation path.

## Production Services

- [x] Approve and connect lifeadmin.grovekind.com as the custom production domain.
- [x] Confirm the privacy, support, and account-deletion URLs on lifeadmin.grovekind.com.
- [x] Configure Clerk production keys, custom domain, and Native API.
- [x] Configure the mobile production API URL and Clerk publishable key in EAS.
- [x] Run the mobile live release check with production environment values.
- [x] Baseline and verify all eight Prisma migrations in the production database.
- [x] Record the current Neon state: PostgreSQL 17 is healthy, branch protection is disabled, and restore history is six hours.
- [ ] Decide whether to upgrade Neon for branch protection and longer restore history before public launch.
- [ ] Obtain passing exact-head CI for PR #113 and merge only after review.
- [ ] Deploy the exact verified main candidate.
- [ ] Verify signed service routes, invalid-request rejection, and Clerk protection for ordinary routes.
- [ ] Verify private R2, email intake, OCR/classification, voice, notification, retention, and cleanup provider flows with fictional data.
- [ ] Complete production web smoke tests.

## Developer Accounts And Signing

- [x] Confirm the Expo account and EAS project are owned by latinmaestro.
- [x] Add the EAS project ID to mobile/app.json.
- [ ] Enrol in and verify the Apple Developer Program account.
- [ ] Accept current Apple agreements.
- [ ] Record the Apple Team ID and App Store Connect app ID privately.
- [ ] Create the App Store Connect record for com.latinmaestro.familylifeadmin.
- [ ] Create or approve App Store Connect API/submission access.
- [ ] Generate Expo-managed iOS signing credentials.
- [ ] Register the signed native iOS configuration with Clerk.
- [ ] Keep console access, recovery details, reviewer credentials, signing files, and secrets outside the repository.
- [ ] Create the Google Play Console app record when Android store delivery is authorised.

## Client Candidate And Acceptance

- [ ] Create the fictional Rivera Household data set with no real personal data or payment identifiers.
- [ ] Produce a current Android preview and iOS simulator candidate from the same exact verified commit.
- [ ] Record immutable Git commit, CI run, Vercel deployment, migrations, provider checks, and EAS build references.
- [ ] Execute the documented production web acceptance journey.
- [ ] Execute the documented native acceptance journey.
- [ ] Verify household isolation with two households and two roles.
- [ ] Verify invitations, role changes, removal safeguards, and last-admin recovery.
- [ ] Verify tasks, reminders, shopping, bills, sources, comments, activity, and recurrence.
- [ ] Verify uploads/camera, forwarded email, bounded OCR/classification drafts, and voice drafts.
- [ ] Verify opt-in notifications, deep links, offline/error/retry states, and accessibility.
- [ ] Verify account/household deletion, retention, and cleanup behaviour.
- [ ] Obtain explicit client acceptance of the production web and native candidate.
- [ ] Resolve every release-blocking defect before freezing version 1.0.0.

## TestFlight And Physical QA

- [ ] Freeze the exact iOS release-candidate commit and rollback plan.
- [ ] Produce the signed iOS production build from the frozen commit.
- [ ] Upload the exact build to TestFlight and record immutable build references.
- [ ] Test on at least one current physical iPhone.
- [ ] Test a representative iPad layout.
- [ ] Verify sign-in, sign-out, recovery, session restoration, and expiry.
- [ ] Verify onboarding, household isolation, roles, invitations, and every household workflow.
- [ ] Verify permission prompts appear only after the user chooses camera, photo upload, voice capture, or notification opt-in.
- [ ] Verify permission denial, revocation, retry, and fallback to manual entry.
- [ ] Verify camera/uploads, forwarded email, OCR/classification drafts, voice drafts, notifications, and deep links.
- [ ] Verify account and household deletion plus documented retention.
- [ ] Complete accessibility, performance, crash-readiness, offline, and error-state checks.
- [ ] Rebuild and repeat affected regression gates after every release-blocking fix.

## Store Materials

- [ ] Capture final fictional screenshots from the approved signed build.
- [ ] Create a support email address owned and monitored by the product operator.
- [x] Confirm store URLs use the production Grovekind domain.
- [ ] Complete Apple privacy details from the frozen-build inventory.
- [ ] Complete Google Play Data safety from the frozen-build inventory when authorised.
- [ ] Complete age rating, encryption/export compliance, content-rights, category, and availability answers.
- [ ] Confirm camera, photo, microphone, and notification purpose strings match actual use.
- [ ] Create a stable fictional reviewer account.
- [ ] Supply reviewer credentials only in App Store Connect.
- [ ] Confirm review notes cover every gated feature and explain review-first automated drafts.
- [ ] Confirm listing and screenshots make no finance, automatic-action, offline-write, or other unsupported claims.

## Submission

- [ ] Tie the exact Git commit, CI, Vercel deployment, migrations, provider health, EAS build, TestFlight result, screenshots, declarations, reviewer access, support operations, and rollback evidence together.
- [ ] Present the final go/no-go report.
- [ ] Obtain explicit release-owner approval to submit version 1.0.0 to Apple App Review.
- [ ] Submit version 1.0.0 only after that approval.
- [ ] Record App Review state and feedback.
- [ ] Resolve defects or metadata issues through scoped reviewed pull requests and rebuild/resubmit when required.
- [ ] Obtain separate explicit approval before public release.

The app is ready for App Review only when every applicable evidence, owner, QA, privacy, and submission gate above is complete.
