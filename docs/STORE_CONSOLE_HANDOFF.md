# Store Console Handoff

This is the release-owner handoff for Family Life Admin version 1.0.0. Repository automation may prepare builds, evidence, and metadata. The account owner must complete identity verification, agreements, store records, reviewer credentials, declarations, availability, submission approval, and public-release approval.

Never place passwords, access tokens, signing files, reviewer credentials, identity documents, or recovery codes in GitHub.

## Shared App Identity

- App name: Family Life Admin
- iOS bundle identifier: com.latinmaestro.familylifeadmin
- Android package: com.latinmaestro.familylifeadmin
- Version: 1.0.0
- Category: Productivity
- Default language: English (Australia)
- Support URL: https://lifeadmin.grovekind.com/support
- Privacy URL: https://lifeadmin.grovekind.com/privacy
- Account-deletion URL: https://lifeadmin.grovekind.com/account-deletion
- Price: Free
- Advertising: None
- In-app purchases: None
- Tracking: None

## Expo

Verified repository/account boundary:

- EAS project d112a576-6adf-4452-b434-4b3cdba7ab0d is owned by latinmaestro.
- Android signing credentials and earlier engineering builds exist.
- Earlier Android preview and production builds predate the frozen Phase 16 candidate and are evidence only.

Owner actions:

- keep Expo recovery and billing access outside the repository;
- approve creation of Expo-managed iOS signing credentials after Apple enrolment;
- approve EAS/App Store Connect submission access;
- retain signing and recovery ownership.

The final iOS build must be produced from the frozen exact verified commit, uploaded to TestFlight, and linked to immutable build evidence.

## Apple Developer And App Store Connect

The intended long-term legal owner must:

1. Enrol in the Apple Developer Program.
2. Complete identity or organisation verification.
3. Accept current Apple agreements.
4. Provide the Apple Team ID, not account credentials, so the bundle and Clerk native configuration can be registered.
5. Create an iOS app in App Store Connect:
   - Name: Family Life Admin
   - Primary language: English (Australia)
   - Bundle ID: com.latinmaestro.familylifeadmin
   - SKU: a private internal value such as family-life-admin-ios
   - User access: the owner's deliberate policy
6. Record the numeric App Store Connect app ID privately.
7. Create an App Store Connect API key or explicitly approve EAS-managed submission access.
8. Provide App Review contact details and stable fictional reviewer credentials only in App Store Connect.
9. Complete category, availability, age rating, encryption/export compliance, App Privacy, content-rights, and permission questions against the frozen build.
10. Approve TestFlight distribution after build evidence and QA are ready.
11. Give separate explicit approval for App Review submission.
12. Give separate explicit approval for public release after review acceptance.

Codex must never handle identity documents, passwords, recovery codes, or legal acceptance.

## Reviewer Account And Data

Create a dedicated reviewer account with fictional Rivera Household data only:

- one open and one completed task;
- a short shopping list;
- a bill reminder and renewal with safe fictional HTTPS sources;
- two fictional household members covering roles;
- a short activity history;
- a fictional private source image or document;
- reviewable OCR/classification and voice drafts containing no payment identifiers;
- notification preferences;
- Settings, privacy, support, and account deletion.

Do not reuse a real household account. Keep reviewer credentials only in App Store Connect.

## Reviewer Paths And Permissions

The review notes must state that automated intake creates drafts only and an authorised member confirms them. Manual entry remains available.

Document deterministic review paths for:

- user-initiated camera/photo source selection;
- private document upload;
- forwarded fictional email intake;
- bounded OCR/classification review;
- user-initiated voice draft;
- notification opt-in and deep link;
- deletion and retention behaviour.

Camera, photo-library, microphone, and notification prompts must appear only after the related user action. Reviewer notes must explain why each prompt appears and what works after denial. Background audio recording and remote-notification background mode are disabled.

Never claim an implemented feature is absent to simplify review. If a live provider flow cannot be safely exposed to the reviewer, state the exact limitation and give a deterministic fictional path.

## Screenshots

Capture final screenshots only from the approved signed build after physical-device QA.

Core scenes:

1. Home
2. Tasks
3. Shopping
4. Bills and renewals
5. Family
6. Settings and privacy

Use fictional Rivera Household data. Remove real names, email addresses, links, source documents, tokens, and credentials. Captions may mention implemented review-first uploads, OCR, email intake, voice drafts, or opt-in notifications only when the captured build demonstrates that exact behaviour.

Do not promise finance features, automatic final actions, payment handling, guaranteed extraction accuracy, background recording, or offline writes.

## Final Evidence Package

Before submission, the release owner should receive one concise audit linking:

- exact Git commit and passing exact-head CI;
- Vercel production deployment and Grovekind smoke tests;
- all eight migrations and provider-health evidence;
- private storage, signed email intake, bounded processing, notification, retention, and deletion checks;
- EAS iOS build and App Store Connect/TestFlight build number;
- current iPhone and representative iPad QA;
- final screenshots, listing, privacy answers, permission strings, age rating, encryption, content rights, reviewer access, and availability;
- support ownership and rollback plan.

## Final Approval Boundary

Owner approval is required for:

- legal agreements and identity verification;
- credentials, account recovery, and support contacts;
- store privacy and policy declarations;
- reviewer credentials;
- production territories and availability;
- TestFlight distribution where account policy requires it;
- Apple App Review submission;
- public release after review acceptance.

No repository checkbox substitutes for explicit owner approval.
