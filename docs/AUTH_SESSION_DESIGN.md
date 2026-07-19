# Auth Session Design

This document defines the approved Clerk authentication, onboarding, and household-session boundary.

## Current State

Clerk is the production identity provider for the web and Expo clients. The application maps Clerk's trusted subject to an internal User through the unique provider/subject pair; it never treats a provider subject as an application user id.

Signed-out users can sign in or create an account. After Clerk verifies the primary email, the onboarding boundary checks for an active application membership:

1. An existing member enters the household workspace.
2. A user with a matching active invitation can join that household.
3. A user without either can create one first household and becomes its `household_admin`.

The runtime may still use `demo` mode for local or static previews. Clerk mode requires configured Clerk and database environment values.

## Identity Bootstrap

`src/lib/server/household-onboarding.ts` is the only first-household bootstrap service.

- It reads identity from Clerk server state, including a verified primary email.
- It checks provider/subject ownership before considering email.
- It refuses to claim an email already owned by a different internal user.
- It creates User, Household, HouseholdSettings, administrator membership, and initial activity atomically.
- It uses a serializable transaction and retries one serialization conflict.
- A repeated request returns the existing active membership instead of creating another household.

Invitation acceptance remains email-bound, requires the signed-in Clerk user's verified primary email, and creates or reactivates only the invited household membership.

## API Boundaries

Normal `/api/v1` household routes use `withHouseholdApi` and require an active membership before the handler runs.

`/api/v1/onboarding` is the narrow exception. It uses `withAuthenticatedApi`, which requires Clerk authentication but intentionally runs before membership exists. It exposes only onboarding status, invitation acceptance, and first-household creation. Responses are private and not cached.

Client-supplied household ids are selections, never authority. Every later household read or write resolves membership on the server.

## Auth Contract

`AuthSession` contains:

- the trusted internal `user`
- an optional `activeHouseholdId`

The optional household id allows a one-primary-household interface now while retaining future multi-household architecture.

## User Experience

- Web sign-in and sign-up return through `/onboarding`.
- Native sign-in and sign-up return through the native onboarding screen.
- Existing members pass through immediately.
- Invitees see one join action.
- New users provide only a household name.
- Account switching remains available without exposing household data.

## Review Rules

Reviewers must confirm:

- identity comes from Clerk server state
- a verified primary email is required for bootstrap and invitation acceptance
- provider/subject mapping remains unique
- first-household creation is atomic and retry-safe
- regular APIs still require active household membership
- the onboarding API has no general household-data access
- household ids supplied by clients are never treated as authority
- responses remain private and non-cacheable
- source privacy and bill/payment source-of-truth rules still pass
