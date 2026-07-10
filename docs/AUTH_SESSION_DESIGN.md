# Auth Session Design

This document defines the approved authentication/session boundary and its staged Clerk implementation.

## Current State

The app has a typed auth/session contract in `src/lib/auth/session.ts`. Clerk is the approved provider, and the SDK, conditional provider wrapper, and Next.js 16 proxy foundation are present behind `FAMILY_LIFE_ADMIN_AUTH_MODE`.

The runtime still defaults to `demo`, and the current session contract returns no active production session. Clerk environment provisioning, internal user mapping, protected sign-in flow, database migrations, and live membership enforcement remain pending.

The app still uses static demo data in the UI.

## Auth Contract

`AuthenticatedUser` represents the trusted user identity after a future auth provider verifies a request.

`AuthSession` contains:

- `user`
- optional `activeHouseholdId`

The optional household id allows the MVP UI to keep optimising for one primary household while the architecture remains ready for future multi-household support.

## Household Access Flow

Future authenticated server code should use this flow:

1. Resolve the trusted user from the session provider.
2. Build an `AuthSession` using `src/lib/auth/session.ts`.
3. Resolve household access with `src/lib/server/household-access.ts`.
4. Require active household membership before live reads or writes.
5. Pass `HouseholdAccessContext` to persistence adapters.

Client-supplied household ids must be treated as selections, not authority. A selected household id must always be checked against active membership before use.

## Current Placeholder Behavior

Until the Clerk session and internal user mapping are implemented:

- `getCurrentAuthSession()` returns `null`.
- `requireCurrentAuthSession()` throws `AuthenticationRequiredError`.
- `getCurrentHouseholdAccessContext()` returns `null` when there is no session.
- `requireCurrentHouseholdAccessContext()` requires a future session and verified household membership.

These helpers must not replace the demo access context until Clerk identity maps to an internal user and active household membership is verified.

## Not Yet Implemented

The current foundation does not add:

- production authentication
- login or logout UI
- session cookies
- invite flows
- database-backed page reads
- database writes
- notifications
- file uploads
- email forwarding
- AI, OCR, or voice capture
- native iOS
- finance features or payment identifier handling

## Review Rules

When production auth is added, reviewers must confirm:

- session user identity comes from a trusted provider
- household access context is resolved server-side
- active household membership is required
- role/capability checks are applied before live reads or writes
- static fallback remains available until each live module is validated
- source reference privacy rules still pass
- bill/payment source-of-truth rules still pass
