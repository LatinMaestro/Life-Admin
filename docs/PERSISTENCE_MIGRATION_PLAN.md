# Persistence Migration Plan

This document defines the planned path from static demo data to live Prisma/PostgreSQL persistence.

## Current State

The app has:

- static demo data for the working UI
- a Prisma/PostgreSQL schema checkpoint
- Prisma 7 tooling and schema validation scripts
- a generated Prisma client in CI
- a server-only Prisma client boundary in `src/lib/server/prisma.ts`
- a server-only persistence adapter selector in `src/lib/server/persistence.ts`
- a server-only demo access context in `src/lib/server/demo-access-context.ts`
- server-only dashboard and module read-model foundations in `src/lib/server/dashboard-read-model.ts` and `src/lib/server/module-read-models.ts`
- a shared read-model summary component in `src/components/read-model-summary.tsx`
- the Sources page reading from the source-reference read model
- static comments mapped through `src/lib/persistence/static-adapter.ts`
- household access-control helpers
- a server-only household access resolver in `src/lib/server/household-access.ts`
- provider-neutral auth/session contracts in `src/lib/auth/session.ts`
- persistence contracts in `src/lib/persistence/contracts.ts`
- a static demo-data adapter in `src/lib/persistence/static-adapter.ts`
- a read-only Prisma adapter foundation in `src/lib/persistence/prisma-adapter.ts`
- a pure static-demo seed snapshot mapper in `src/lib/persistence/demo-seed.ts`

The app does not yet have:

- migrations
- live database connection
- executable seed script
- production authentication provider
- real session resolution
- wired live writes in app routes
- all UI pages switched fully to repository read models

## Migration Principles

- Keep every live query household-scoped.
- Resolve `HouseholdAccessContext` before live reads or writes.
- Move one module at a time from static data to persistence.
- Keep static demo data available as a fallback until the equivalent live path is validated.
- Do not introduce uploads, email forwarding, AI, OCR, voice capture, notifications, native iOS, finance analytics, or payment identifier handling during persistence migration.

## Repository Boundary

Future live modules should depend on repository-style contracts rather than calling Prisma directly from pages.

The initial contract is `HouseholdPersistenceAdapter`, which combines:

- `HouseholdWorkspaceRepository`
- `HouseholdDashboardRepository`

Server-side repository implementations should import Prisma from `src/lib/server/prisma.ts`. Do not create additional Prisma clients in pages, components, route handlers, or server actions.

The static adapter and Prisma adapter both implement the same contract. The static adapter keeps the current demo data behind the repository boundary, while the Prisma adapter prepares the future live-data path.

`src/lib/server/persistence.ts` selects the server-side adapter. `FAMILY_LIFE_ADMIN_PERSISTENCE_MODE` defaults to `static`; `prisma` should only be used after production auth, database environment variables, and live-read rollout are approved.

`src/lib/server/demo-access-context.ts` can provide a static `HouseholdAccessContext` for repository-backed demo reads before production auth is selected. It is not a production auth substitute.

`src/lib/server/dashboard-read-model.ts` and `src/lib/server/module-read-models.ts` begin the page migration by building repository-backed summary data.

`src/components/read-model-summary.tsx` provides a shared mobile-friendly display component for repository-backed page migrations.

All adapters must require `HouseholdAccessContext` and scope every query by `householdId`. They should not read records by id alone.

This keeps household scoping and access context visible at the data boundary.

## Auth And Access Resolution Boundary

Future authenticated routes and server actions should not construct household access context from client input alone.

The intended flow is:

1. Resolve `userId` from the trusted session provider.
2. Populate the provider-neutral `AuthSession` boundary in `src/lib/auth/session.ts`.
3. Pass `userId` and an optional selected `householdId` to `src/lib/server/household-access.ts`.
4. Verify an active `HouseholdMember` row exists.
5. Pass the returned `HouseholdAccessContext` to repository/adapters.
6. Apply role/capability checks before reads or writes.

This boundary is present now as a foundation only. It does not add a production auth provider, real session handling, middleware, live page queries, or database writes.

## Seed Data Bridge

`src/lib/persistence/demo-seed.ts` maps current static demo records into a schema-shaped `DemoSeedSnapshot` for future seed work.

This bridge is pure TypeScript and does not call Prisma. It does not create records, run migrations, connect to a database, or wire app pages to live data.

Display-only date labels are preserved separately from real database date fields so future seed work can choose verified dates deliberately.

## Suggested Implementation Order

1. Add Prisma dependencies and regenerate the pnpm lockfile. Done.
2. Add schema validation scripts. Done.
3. Add a Prisma client singleton for server-side use. Done.
4. Add an adapter that implements `HouseholdPersistenceAdapter` using Prisma. Done for read-only foundation.
5. Add a server-side household access resolver. Done.
6. Add provider-neutral auth/session contracts. Done.
7. Add static-demo seed snapshot mapping. Done.
8. Add a static demo-data adapter behind the persistence contract. Done.
9. Add a server-only adapter selector that defaults to static mode. Done.
10. Add a demo access context for static repository reads. Done.
11. Add dashboard read-model foundation behind the adapter boundary. Done.
12. Add module read-model foundations behind the adapter boundary. Done.
13. Add shared read-model summary UI component. Done.
14. Move Sources page to the source-reference read model. Done.
15. Map static comments through the persistence adapter. Done.
16. Select and add production auth/session provider.
17. Move remaining UI pages fully to the adapter boundary module by module.
18. Move shared inbox writes.
19. Move tasks and reminders writes.
20. Move shopping list writes.
21. Move bills and renewals writes with source-of-truth review.
22. Move source references as metadata/pointers only.
23. Move comments and activity history.

## Bill And Source Safety

Bills and renewals remain admin reminders only. Persistence migration must not add fields, UI, or logs for generated/transcribed payment identifiers such as BPAY biller codes, BSBs, account numbers, CRNs, customer reference numbers, or payment reference values.

Source references remain metadata/pointers. Uploads and document previews are separate future phases.

## Review Gates

Every persistence PR should confirm:

- household access context is required
- queries include household scope
- no record-id-only read/write paths were added
- source references remain private metadata/pointers
- bill/payment source-of-truth rules still pass
- static fallback remains available until live behavior is verified
