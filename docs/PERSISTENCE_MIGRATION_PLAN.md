# Persistence Migration Plan

This document defines the planned path from static demo data to live Prisma/PostgreSQL persistence.

## Current State

The app has:

- static demo data for the working UI
- a Prisma/PostgreSQL schema checkpoint
- Prisma 7 tooling and schema validation scripts
- a generated Prisma client in CI
- a server-only Prisma client boundary in `src/lib/server/prisma.ts`
- household access-control helpers
- persistence contracts in `src/lib/persistence/contracts.ts`
- a read-only Prisma adapter foundation in `src/lib/persistence/prisma-adapter.ts`

The app does not yet have:

- migrations
- live database connection
- production authentication
- session resolution
- wired live reads or writes in app routes

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

The Prisma adapter must require `HouseholdAccessContext` and scope every query by `householdId`. It should not read records by id alone.

This keeps household scoping and access context visible at the data boundary.

## Suggested Implementation Order

1. Add Prisma dependencies and regenerate the pnpm lockfile. Done.
2. Add schema validation scripts. Done.
3. Add a Prisma client singleton for server-side use. Done.
4. Add an adapter that implements `HouseholdPersistenceAdapter` using Prisma. In progress.
5. Add auth/session resolution.
6. Resolve `HouseholdAccessContext` from session plus `HouseholdMember` row.
7. Move dashboard read models to the adapter.
8. Move shared inbox reads, then writes.
9. Move tasks and reminders.
10. Move shopping lists.
11. Move bills and renewals with source-of-truth review.
12. Move source references as metadata/pointers only.
13. Move comments and activity history.

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
