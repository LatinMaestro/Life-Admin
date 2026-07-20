# QA Evidence

## Purpose

Release evidence is generated in GitHub Actions so development does not depend on a local OneDrive checkout or frequent Vercel previews.

## Phase 14 Automated Evidence

Every pull request to `main` verifies:

- the production Next.js build;
- nine household web routes in a real Chromium browser;
- phone and desktop viewport rendering;
- main landmarks and page headings;
- visible controls have accessible names;
- no horizontal page overflow;
- browser console and runtime errors;
- permanent product-scope language guardrails;
- iOS JavaScript bundle export;
- Android JavaScript bundle export;
- all existing unit, migration, privacy, payment-source, authorization, and lifecycle checks.

Phone and desktop screenshots are uploaded to the CI run as `release-smoke-screenshots`. They contain fictional demo data only and expire with GitHub's artifact-retention policy.

## Deferred Physical Validation

The following require a native preview build or physical device and belong to the controlled client-test candidate:

- operating-system camera, microphone, and push prompts;
- camera crop/retake quality;
- remote push receipt through APNs and FCM;
- background/terminated notification tap behavior;
- slow or interrupted mobile networks;
- screen-reader output on physical iOS and Android devices.

Paid Apple Developer and Google Play accounts are not required for Phase 14. Any test that needs store signing remains deferred until after client acceptance, as approved.

## Release Blockers

A candidate is blocked when any release journey returns an error, produces horizontal overflow, exposes unnamed controls, emits browser errors, fails either native bundle, violates a privacy/payment guardrail, or cannot be reproduced from a clean GitHub checkout.
