# Mobile App Store Roadmap

## Goal

Ship Family Life Admin as a genuine native household administration app on the Apple App Store and Google Play while preserving the same household authorization, privacy, bill-source, and beginner-usability rules as the web app.

## Architecture Decision

Use Expo/React Native with Expo Router for one iOS and Android product codebase. The native app consumes versioned Next.js route-handler APIs. Server authorization, household ownership checks, activity logging, and persistence remain in shared server services.

Do not ship a thin WebView wrapper. Apple states that an app should provide utility and UI beyond a repackaged website. A real native client also gives clearer control over authentication, accessibility, deep links, secure storage, and later platform capabilities.

## Authentication

- Use the Clerk Expo SDK.
- Store sessions using Expo SecureStore.
- Prefer production-stable Clerk Expo flows; Clerk's fully native prebuilt components remain beta as of July 2026.
- Support email authentication first.
- If Google or another third-party primary login is offered on iOS, provide the equivalent privacy-preserving login option required by Apple's login-services rule.
- Resolve every API request to an internal provider-subject user and active household membership.
- Fail closed for signed-out, unmapped, inactive, or cross-household requests.

## API Plan

### v1 Foundation

- `GET /api/v1/bootstrap`: household identity, current member, active member choices, and module counts.
- No cache of private responses.
- ISO 8601 date serialization.
- Stable error envelope.
- No static/demo fallback.

### Module Endpoints

Add read and write endpoints in small groups:

1. Inbox and manual routing.
2. Tasks and reminders.
3. Shopping lists and items.
4. Bills, renewals, and safe source references.
5. Family, settings, comments, and activity.
6. Account deletion and privacy controls.

Each write must reuse the existing transactional household service. Native-supplied household, actor, creator, or ownership identifiers are never trusted.

## Native Product Scope

### First Store Build

- Sign in and access-pending states.
- Home.
- Inbox.
- Tasks and reminders.
- Shopping.
- Bills and renewals.
- Family.
- Sources.
- Activity.
- Settings and sign out.
- Account deletion entry point.
- Loading, empty, error, retry, and offline-read-error states.

### Approved Pre-Store Expansion

- Self-service onboarding and full native workflow completion.
- Advanced recurrence.
- Private uploads and user-initiated camera capture.
- Household email forwarding.
- Direct text extraction and OCR.
- Bounded reviewable classification.
- User-initiated voice capture and narrow speech-to-text.
- Opt-in push notifications.
- Automated security, end-to-end, emulator, final UI, and client acceptance gates.

Still excluded: background sync/offline writes, general-purpose generative AI, finance features, payment execution, and structured payment identifier storage or transcription.

## Privacy And Store Compliance

Before store submission:

- Publish an accessible privacy policy and support page.
- Publish a web account-deletion request path for Google Play.
- Provide in-app account deletion where account creation is supported.
- Delete or appropriately retain data across Clerk and PostgreSQL according to the published policy.
- Complete Apple privacy disclosures and Google Play Data safety declarations.
- Review all third-party SDK data practices.
- Use fictional household data in screenshots and review materials.
- Provide a stable reviewer account or an approved full-feature demo mode.
- Provide current support contact details.

References:

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Google Play account deletion: https://support.google.com/googleplay/android-developer/answer/13327111
- Expo Router: https://docs.expo.dev/router/introduction/
- Clerk Expo SDK: https://clerk.com/docs/reference/expo/overview

## Delivery Stages

1. Web production and authenticated QA.
2. Store compliance and account deletion.
3. Versioned mobile API with tests.
4. Expo scaffold and authentication.
5. Core module parity.
6. Complete Phases 1-15 in `docs/PHASES_1_TO_16.md`.
7. Deploy the controlled client-test candidate and obtain client approval.
8. Create paid store accounts and final signed builds only after approval.
9. TestFlight and Google Play internal testing.
10. Store assets, forms, controlled submission, and post-launch support.

## External Inputs Required Before Submission

- Apple Developer and Google Play developer accounts.
- Custom production domain and support email.
- Privacy policy owner/legal publisher details.
- Store territories and age-rating answers.

Approved build identity: display name `Family Life Admin`; iOS and Android identifier `com.latinmaestro.familylifeadmin`. The remaining inputs do not block application development, but they do block signed store submission.
