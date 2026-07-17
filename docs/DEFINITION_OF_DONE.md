# Definition Of Done

A Family Life Admin change is done only when it is useful, household-scoped, privacy-preserving, beginner-friendly, and covered by the relevant review gates.

## General Criteria

- The change supports household administration.
- Household ownership and role checks are enforced on the server.
- No personal-finance behavior is introduced.
- Privacy, source-document, and bill-source rules are preserved.
- Empty, loading, success, error, and retry states are considered.
- Documentation matches shipped behavior.
- Applicable lint, guardrail, typecheck, build, migration, and test checks pass.

## Bill And Renewal Criteria

- Bills and renewals remain admin reminders.
- Only approved provider, timing, status, notes, assignee, reminder, and source-reference data is used.
- No payment identifiers are stored, displayed, generated, transcribed, logged, or included in analytics.
- Users are returned to an original source reference.

## API Criteria

- The endpoint is versioned.
- Authentication and active household membership fail closed.
- Household and actor context is server-derived.
- Inputs and outputs follow explicit contracts.
- Private responses use no-store behavior.
- Errors reveal no household data.
- Automated tests cover authorization and household isolation.

## Native Feature Criteria

- iOS and Android behavior is consistent unless a platform difference is intentional.
- The screen follows the one-primary-action design rule.
- Accessibility labels, dynamic text, touch targets, keyboard behavior, loading, empty, error, and retry states pass.
- No sensitive data is written to device logs or unsecured storage.
- Physical-device validation is recorded.

## Store Release Criteria

- Core workflows work against the production backend.
- Privacy, support, and account-deletion resources are live.
- Store disclosures match real data handling.
- Reviewer access works.
- Screenshots contain fictional data.
- Signing, identifiers, versioning, age rating, descriptions, and review notes are complete.
- TestFlight and Google Play internal testing pass before public submission.
