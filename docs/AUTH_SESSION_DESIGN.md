# Auth Session Design

This document defines the approved authentication/session boundary before a production auth provider is selected.

## Current State

The app has a typed auth/session contract in `src/lib/auth/session.ts`, but production authentication is not implemented.

The current contract intentionally returns no active session. It exists so future server routes, server actions, and repository code can depend on a stable shape without selecting or wiring an auth provider too early.

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

## Placeholder Behavior

Until a provider is approved and implemented:

- `getCurrentAuthSession()` returns `null`.
- `requireCurrentAuthSession()` throws `AuthenticationRequiredError`.
- `getCurrentHouseholdAccessContext()` returns `null` when there is no session.
- `requireCurrentHouseholdAccessContext()` requires a future session and verified household membership.

These helpers should not be wired into static UI pages until the production auth provider and persistence migration step are approved.

## Out Of Scope

This boundary does not add:

- production authentication
- login or logout UI
- session cookies
- middleware
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
