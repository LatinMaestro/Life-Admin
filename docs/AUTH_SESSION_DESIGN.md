# Auth Session Design

This document defines the approved authentication/session boundary and its staged Clerk implementation.

## Current State

The app has a typed auth/session contract in `src/lib/auth/session.ts`. Clerk is the approved provider, and the SDK, conditional provider wrapper, and Next.js 16 proxy foundation are present behind `FAMILY_LIFE_ADMIN_AUTH_MODE`.

The runtime still defaults to `demo`. In `clerk` mode, the server session adapter resolves Clerk's trusted subject and maps it to an internal User using the unique provider/subject pair. Signed-out or unmapped identities return no application session. Clerk environment provisioning and the database migration remain pending. The sign-in, unmapped-account, protected workspace, and read-model membership paths are present but inactive.

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

Until Clerk mode is activated with a migrated and seeded database:

- `getCurrentAuthSession()` returns `null` in demo mode and for signed-out or unmapped Clerk identities.
- `requireCurrentAuthSession()` throws `AuthenticationRequiredError`.
- `getCurrentHouseholdAccessContext()` returns `null` when there is no session.
- `requireCurrentHouseholdAccessContext()` requires a future session and verified household membership.

The session adapter never treats a Clerk subject as an application user id and never links by email alone. These helpers must not replace the demo access context until the schema migration exists, the Clerk identity is mapped to an internal user, and active household membership is verified.

## Not Yet Implemented

The inactive access-state foundation does not add:

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
