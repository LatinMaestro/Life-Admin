# Persistence Migration Plan

This document defines the planned path from static demo data to live Prisma/PostgreSQL persistence.

## Current State

The app has:

- static demo data for the working UI
- a Prisma/PostgreSQL schema checkpoint
- a generated and reviewed initial PostgreSQL migration that has not been applied
- Prisma 7 tooling and schema validation scripts
- a generated Prisma client in CI
- a server-only Prisma client boundary in `src/lib/server/prisma.ts`
- a server-only persistence adapter selector in `src/lib/server/persistence.ts`
- a server-only runtime access resolver that selects demo context only in demo mode and requires verified session membership in Clerk mode
- server-only dashboard, module, and workspace read-model foundations in `src/lib/server/`
- a shared read-model summary component in `src/components/read-model-summary.tsx`
- the Inbox, Tasks, Lists, and Bills pages reading from their module read models
- the Sources page reading from the source-reference read model
- the Activity page reading from the comments/activity read model
- the Dashboard, Family, and Settings pages reading from household-scoped server read models
- the app shell receiving server-resolved household and current-member context
- static comments mapped through `src/lib/persistence/static-adapter.ts`
- household access-control helpers
- a server-only household access resolver in `src/lib/server/household-access.ts`
- provider-neutral auth/session contracts with Clerk-to-internal-user mapping in `src/lib/auth/session.ts`
- persistence contracts in `src/lib/persistence/contracts.ts`
- a static demo-data adapter in `src/lib/persistence/static-adapter.ts`
- a read-only Prisma adapter foundation in `src/lib/persistence/prisma-adapter.ts`
- a pure static-demo seed snapshot mapper in `src/lib/persistence/demo-seed.ts`

The app does not yet have:

- live database connection or applied migration
- executable seed script
- wired live writes in app routes

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

`src/lib/server/runtime-access-context.ts` resolves read-model access. Demo mode uses the static demo context; Clerk mode requires a mapped internal user and active household membership. It never falls back from Clerk mode to demo access.

`src/lib/server/dashboard-read-model.ts`, `src/lib/server/module-read-models.ts`, and `src/lib/server/workspace-read-model.ts` build household-scoped page and shell data behind the adapter boundary.

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

This boundary is present at code checkpoint. Clerk activation still requires environment provisioning, the reviewed schema migration, mapped users and memberships, and production access-state QA. It does not add database writes.

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
16. Move Activity page to the comments/activity read model. Done.
17. Move Inbox, Tasks, Lists, and Bills pages to module read models. Done.
18. Move Dashboard, Family, Settings, and the app shell to household-scoped read models. Done.
19. Audit remaining direct static dependencies and keep them behind demo boundaries. Done.
20. Select and add production auth/session provider. Done at inactive code checkpoint.
21. Require runtime household access in all server read models. Done at code checkpoint.
22. Generate and review the initial PostgreSQL migration. Done; not applied.
23. Provision the production PostgreSQL database and apply migrations through a controlled deployment.
24. Move shared inbox writes.
25. Move tasks and reminders writes.
26. Move shopping list writes.
27. Move bills and renewals writes with source-of-truth review.
28. Move source references as metadata/pointers only.
29. Move comments and activity history.

## Bill And Source Safety

Bills and renewals remain admin reminders only. Persistence migration must not add fields, UI, or logs for generated/transcribed payment identifiers such as BPAY biller codes, BSBs, account numbers, CRNs, customer reference numbers, or payment reference values.

Source references remain metadata/pointers. Uploads and document previews are separate future phases.

## Review Gates

`pnpm db:migrate:status` may inspect a configured database and `pnpm db:migrate:deploy` may apply committed migrations. Neither command should target production until the database and deployment gate are approved.

Every persistence PR should confirm:

- household access context is required
- queries include household scope
- no record-id-only read/write paths were added
- source references remain private metadata/pointers
- bill/payment source-of-truth rules still pass
- static fallback remains available until live behavior is verified
