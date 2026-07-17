# Store Submission Checklist

This checklist separates completed repository work from release-owner steps that require external accounts, production credentials, signed builds, or physical devices.

## Repository Gates

- [x] iOS and Android app identifiers are stable.
- [x] Version 1.0.0 and native build numbers are configured.
- [x] EAS preview, production, and submission profiles are present.
- [x] App icon, Android adaptive/monochrome icon, and splash artwork are configured.
- [x] Camera, microphone, and notification permissions are blocked.
- [x] Native typecheck and structural release checks run in CI.
- [x] Privacy, support, and account-deletion pages exist in the web app.
- [x] Account deletion has last-admin and household ownership safeguards.
- [x] Native password recovery uses Clerk's email-code flow.
- [x] Store listing copy and reviewer guidance are documented.
- [x] Store privacy declarations are mapped to the current implementation.
- [x] Bill/payment source-of-truth guardrails remain enforced.

## Production Services

- [x] Approve and connect `lifeadmin.grovekind.com` as the custom production domain.
- [x] Confirm the privacy, support, and account-deletion URLs on `lifeadmin.grovekind.com`.
- [ ] Configure Clerk production keys and allowed origins/redirects.
- [ ] Configure the mobile production API URL and Clerk publishable key in EAS.
- [ ] Run `npm run release:check:live` from `mobile/` with production environment values.
- [ ] Confirm Neon backups, retention, and production access ownership.
- [ ] Complete a production web smoke test after the final main deployment.

## Developer Accounts And Signing

- [ ] Confirm organisation ownership of the Expo account and EAS project.
- [ ] Add `extra.eas.projectId` to `mobile/app.json` after the EAS project is created.
- [ ] Enrol in and verify the Apple Developer Program account.
- [ ] Create the App Store Connect app record for `com.latinmaestro.familylifeadmin`.
- [ ] Create the Google Play Console app record with the same package identifier.
- [ ] Generate remote iOS and Android signing credentials through EAS.
- [ ] Store console access and recovery details outside the repository.
- [ ] Never commit production keys, reviewer passwords, signing files, or service credentials.

## Internal Builds And QA

- [ ] Produce an EAS preview build for iOS and Android.
- [ ] Test on at least one physical iPhone and one physical Android phone.
- [ ] Test a representative tablet layout or emulator for each supported platform.
- [ ] Verify sign-in, sign-out, forgotten-password recovery, session recovery, and expired-session handling.
- [ ] Verify household isolation with two households and two member roles.
- [ ] Verify invitations, role changes, member removal safeguards, and last-admin recovery.
- [ ] Verify task, reminder, shopping, bill, source, comment, and activity workflows.
- [ ] Verify account deletion and retained/deleted data behaviour.
- [ ] Verify source links reject unsafe schemes and expose no payment identifiers.
- [ ] Verify loading, empty, validation, offline/error, retry, and accessibility states.
- [ ] Confirm no camera, microphone, notification, contact, location, or photo permission prompt appears.
- [ ] Resolve every release-blocking defect before production builds.

## Store Materials

- [ ] Capture screenshots with fictional Rivera Household data.
- [ ] Create a support email address owned by the product operator.
- [ ] Replace every placeholder URL in `docs/STORE_LISTING.md`.
- [ ] Reconcile `docs/STORE_PRIVACY_DECLARATIONS.md` against production Clerk, Vercel, Neon, and Expo settings.
- [ ] Complete Apple privacy details from the reconciled inventory.
- [ ] Complete Google Play Data safety from the reconciled inventory.
- [ ] Complete content-rating and encryption questionnaires truthfully.
- [ ] Create a stable reviewer account with fictional data.
- [ ] Supply reviewer credentials privately in each store console.
- [ ] Confirm the listing does not promise deferred functionality.

## Submission

- [ ] Produce signed production builds with auto-incremented build numbers.
- [ ] Submit first to TestFlight and Google Play internal testing.
- [ ] Complete a final release-candidate regression pass.
- [ ] Confirm support monitoring and account-deletion operations are staffed.
- [ ] Submit version 1.0.0 for store review.
- [ ] Record store feedback and fixes in scoped GitHub issues and pull requests.
- [ ] Promote only the exact approved build after review acceptance.

The app is code-complete for a first store candidate when repository gates pass. It is release-ready only when every applicable external, QA, privacy, and submission item above is complete.
