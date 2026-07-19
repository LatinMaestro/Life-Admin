# Store Console Handoff

This is the release-owner handoff for Family Life Admin version 1.0.0. Repository automation can prepare builds and metadata, but the account owner must complete identity verification, agreements, store records, reviewer credentials, declarations, and final submission approvals.

Never place passwords, access tokens, signing files, reviewer credentials, government identity documents, or recovery codes in GitHub.

## Shared App Identity

- App name: `Family Life Admin`
- iOS bundle identifier: `com.latinmaestro.familylifeadmin`
- Android package: `com.latinmaestro.familylifeadmin`
- Version: `1.0.0`
- Category: Productivity
- Default language: English (Australia)
- Support URL: `https://lifeadmin.grovekind.com/support`
- Privacy URL: `https://lifeadmin.grovekind.com/privacy`
- Account-deletion URL: `https://lifeadmin.grovekind.com/account-deletion`
- Price: Free
- Advertising: None
- In-app purchases: None
- Tracking: None

## Expo

Client-only setup:

- [ ] Save an Expo personal access token as the GitHub repository Actions secret `EXPO_TOKEN`.
- [ ] Confirm the EAS project is owned by the intended long-term Expo account.
- [ ] Keep account recovery and billing access outside the repository.

After the secret is available, GitHub automation can create the EAS project, record its project ID, configure non-secret environment values, and start Android build preparation.

## Apple Developer And App Store Connect

Client-only setup:

1. Enrol in the Apple Developer Program using the intended long-term legal owner.
2. Complete identity or organisation verification.
3. Accept current Apple agreements.
4. Record the Apple Team ID for native Clerk registration.
5. In App Store Connect, create a new iOS app:
   - Name: `Family Life Admin`
   - Primary language: English (Australia)
   - Bundle ID: `com.latinmaestro.familylifeadmin`
   - SKU: an internal value such as `family-life-admin-ios`
   - User access: Full Access unless the account has a deliberate restricted-access policy
6. Record the numeric App Store Connect app ID for EAS Submit.
7. Create an App Store Connect API key or approve EAS-managed submission access.
8. Supply App Review contact details and fictional reviewer credentials privately in App Store Connect.
9. Complete age rating, encryption, privacy, availability, and content-rights questions truthfully.
10. Approve final TestFlight distribution and App Review submission.

The Account Holder must accept current agreements before a new App Store Connect record can be created.

## Google Play Console

Client-only setup:

1. Create or verify the intended long-term Play Console developer account.
2. Complete identity, contact, payments-profile, and Android-device verification where requested.
3. Create the app:
   - Default language: English (Australia)
   - Name: `Family Life Admin`
   - Type: App
   - Price: Free
4. Accept the Developer Program, export-law, and Play App Signing declarations.
5. Use `com.latinmaestro.familylifeadmin` for the first uploaded Android App Bundle.
6. Create an internal testing track and tester list.
7. Supply fictional sign-in details and instructions under App content because the app is login-restricted.
8. Complete the privacy policy, ads, target audience, content rating, Data safety, account deletion, and app-access declarations.
9. After the first manual upload, create a Google service account for later EAS submissions if desired.
10. Approve closed testing and production rollout when testing requirements are satisfied.

For a personal developer account created after 13 November 2023, Google currently requires a closed test with at least 12 continuously opted-in testers for 14 days before production access can be requested. Internal testing can still begin first.

## Reviewer Account

Create one dedicated reviewer account with fictional household data only.

The reviewer household should make these flows easy to inspect:

- Home with a small number of current items
- One open and one completed task
- One short shopping list
- One bill reminder and one renewal with safe fictional HTTPS source references
- Two fictional members covering both roles
- A short activity history
- Settings, support, privacy, and account deletion

Do not reuse a real household account. Store reviewer credentials only in the private review consoles.

## Screenshots

Capture final screenshots only from the signed release candidate after physical-device QA.

Required scenes:

1. Home
2. Tasks
3. Shopping
4. Bills and renewals
5. Family
6. Settings and privacy

Use fictional Rivera Household data. Remove real names, email addresses, links, source documents, and credentials. Do not add captions that promise notifications, uploads, OCR, AI, email forwarding, voice capture, offline writes, or finance functionality.

## Final Approval Boundary

Codex may prepare, build, validate, and upload internal candidates when credentials permit. The release owner must personally approve:

- legal agreements and identity verification;
- store privacy and policy declarations;
- reviewer credentials;
- production territories and availability;
- final submission for Apple or Google review;
- production rollout after approval.
