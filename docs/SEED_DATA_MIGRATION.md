# Seed Data Migration

This document defines how the static demo data can be prepared for a future database seed without adding live persistence yet.

## Current State

`src/lib/persistence/demo-seed.ts` exports `getDemoSeedSnapshot()`, a pure TypeScript mapper from the current static demo data to schema-shaped seed records.

This is a planning and migration bridge only. It does not connect to PostgreSQL, call Prisma, create migrations, insert records, or wire app pages to live data.

## Why This Exists

The static MVP already contains useful household-scoped sample data. Before moving modules to live persistence, the app needs a clear map from the static data shape to the Prisma/PostgreSQL shape.

The snapshot helps future work validate:

- household ownership
- demo users required by household members
- member ownership fields
- enum naming differences between UI labels and schema values
- source reference metadata
- bill and renewal reminder boundaries

## Mapping Rules

The snapshot includes:

- users for demo household members using `example.invalid` emails
- one household
- household settings
- household members
- source references
- inbox items
- tasks
- reminders
- shopping lists and items
- bills and renewals
- activity events

Display-only date labels are preserved as `dueLabel`. Real database date fields such as `dueAt`, `remindAt`, and `renewalAt` remain `null` until a future seed script deliberately chooses verified dates.

This avoids converting informal UI copy into authoritative due dates.

## Bill And Payment Rules

Seed data must keep bills and renewals as admin reminders only.

The seed snapshot must not include generated or transcribed payment identifiers, including BPAY biller codes, BSBs, account numbers, CRNs, customer reference numbers, payment references, or equivalent payment instructions.

Payment-related reminders must continue to point back to source references rather than duplicating payment details.

## Out Of Scope

This step does not add:

- Prisma seed execution
- database writes
- migrations
- production authentication
- live page reads
- file uploads
- email forwarding
- AI, OCR, or voice capture
- notifications
- native iOS
- finance features

## Future Use

When live persistence is approved, a future seed script may consume `getDemoSeedSnapshot()` after review.

Before any executable seed script is added, reviewers must confirm:

- it targets a safe non-production environment by default
- all records remain household-scoped
- all required user/member relationships are explicit
- date fields are deliberate and reviewed
- source reference privacy rules still pass
- bill/payment source-of-truth rules still pass
