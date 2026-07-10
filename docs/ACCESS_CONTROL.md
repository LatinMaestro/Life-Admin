# Access Control

This document defines the access-control posture for Family Life Admin as the app moves from static demo data to production authentication and persistence.

## Current State

The app has a static MVP, a Prisma schema checkpoint, and server-side access-control foundations. Production authentication, sessions, middleware, live database reads, live database writes, and authorization enforcement in routes are not wired yet.

`src/lib/access-control.ts` defines pure TypeScript helpers for the future live-data layer. These helpers do not authenticate a user by themselves. They define the shape and checks every live route, server action, and data query should use once authentication and persistence are added.

`src/lib/server/household-access.ts` defines the server-only resolver that will bridge a future authenticated user id to a verified active `HouseholdMember` row. It does not implement an auth provider or session handling. Future server routes and server actions should resolve the authenticated user from the session first, then call this resolver to build `HouseholdAccessContext`.

`src/lib/auth/session.ts` defines the provider-neutral auth/session contract. It currently returns no session and does not implement login, cookies, middleware, invite flows, or provider-specific behavior.

`src/lib/server/demo-access-context.ts` provides a server-only demo context for the current static household/member. It is only a bridge for static MVP data and must not be treated as production authentication.

## Core Rule

Never read, mutate, or display a household record by record id alone.

Every production query must be scoped by:

- authenticated user
- household membership
- active household id
- role/capability where required

## Access Context

A future authenticated request should resolve a `HouseholdAccessContext` containing:

- `userId`
- `householdId`
- `memberId`
- `role`

This context should come from the authenticated session plus a verified `HouseholdMember` row. It should not come from arbitrary client input.

When authentication is added, the intended server-side flow is:

1. Resolve `userId` from the trusted session provider.
2. Build an `AuthSession` through the provider-neutral session boundary.
3. Optionally accept an active `householdId` selected by the user.
4. Call `resolveHouseholdAccessContext({ userId, householdId })`.
5. Require the resulting context before live reads or writes.
6. Apply role/capability checks at the data boundary and mutation boundary.

For routes/actions that require access, use `requireCurrentHouseholdAccessContext(...)` or `requireHouseholdAccessContext(...)` so missing sessions, missing memberships, or inactive household memberships fail closed.

For static MVP bridge work only, `getDemoHouseholdAccessContext()` may be used to move demo reads behind repository contracts before production auth is selected.

## Role Model

MVP roles remain:

- `household_admin`
- `household_member`

Household admins may manage household settings, members, shared items, comments, and source references.

Household members may manage shared items, comments, and source references according to the MVP role rules.

## Query Rules

Future Prisma queries should include `householdId` from the access context.

Preferred pattern:

```ts
const where = createHouseholdScopedWhere(context);
```

Then compose the query with household scope:

```ts
await prisma.task.findMany({ where: { ...where, status: "open" } });
```

Avoid:

```ts
await prisma.task.findUnique({ where: { id: taskId } });
```

Record-id-only reads risk cross-household data exposure if a user guesses or receives another household's id.

## Source Reference Privacy

Source references may point to sensitive household documents, links, images, emails, or future user-confirmed crops. Future source-reference queries must require household membership and should avoid exposing source metadata outside the active household.

Do not log source contents, sensitive metadata, or external references unnecessarily.

## Bills And Renewals

Bills and renewals remain admin reminders only. Access control must not introduce payment instruction handling, payment identifier storage, or finance analytics.

Bill and renewal records may store source references, but must not store generated/transcribed BPAY biller codes, BSBs, account numbers, customer reference numbers, CRNs, payment reference values, or equivalent payment identifiers.

## Future Implementation Order

1. Select and add an auth provider and session strategy.
2. Resolve the active user from the trusted session provider.
3. Populate the provider-neutral `AuthSession` contract.
4. Resolve household membership from the database with `src/lib/server/household-access.ts`.
5. Build `HouseholdAccessContext` server-side.
6. Require permissions before live reads/mutations.
7. Move modules from static data to live persistence one at a time.
