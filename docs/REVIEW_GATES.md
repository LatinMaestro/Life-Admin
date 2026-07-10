# Review Gates

Review gates protect the product boundary, household privacy, and implementation quality. Each phase should pass the relevant gate before continuing.

## Gate 1: Scope Boundary

Confirm the change supports household admin only.

Checklist:

- No budgeting, transaction, bank import, spend analytics, cashflow, tax, property, or loan functionality.
- Bills and renewals remain admin reminders only.
- Manual creation remains the MVP default.
- Deferred capabilities remain deferred unless explicitly approved.

## Gate 2: Household Ownership

Confirm every core record is household-scoped.

Checklist:

- Data belongs to a household.
- Access depends on household membership.
- MVP can use one primary household without blocking future multi-household support.
- Cross-household leakage is not possible by route, API, query, or UI state.
- App pages and shared components use server read models rather than raw demo-data imports.
- `pnpm guardrails:static-data-boundary` passes.

## Gate 3: Roles And Permissions

Confirm MVP role behavior is clear.

Checklist:

- Household admin abilities are defined.
- Household member abilities are defined.
- Admin-only settings are protected.
- Role labels are understandable to non-technical users.

## Gate 4: Privacy And Documents

Confirm household documents and links are handled conservatively.

Checklist:

- Source documents are private to the household.
- Sensitive document data is not displayed in summaries unless needed.
- Links and source references are not exposed outside authorised household members.
- Upload/storage behavior has been explicitly approved before implementation.

## Gate 5: Bill Payment Source Of Truth

Confirm bill/payment safety rules.

Checklist:

- No generated/transcribed BPAY biller codes.
- No generated/transcribed BSBs.
- No generated/transcribed account numbers.
- No generated/transcribed customer reference numbers.
- No generated/transcribed payment reference values.
- Payment-related reminders point back to original source documents, links, emails, images, or user-confirmed crops/references.
- `pnpm guardrails:payment-source` passes for app source and Prisma schema files.

## Gate 6: Mobile Usability

Confirm the workflow is practical on a phone.

Checklist:

- Primary actions are reachable.
- Lists, tasks, reminders, and due items are easy to scan.
- Text fits within controls.
- The interface is calm and task-focused.

## Gate 7: Documentation

Confirm docs remain current.

Checklist:

- Product behavior matches documentation.
- Scope changes are recorded.
- Security/privacy decisions are recorded.
- Data model changes are recorded.
- Future-phase boundaries are preserved.

## Gate 8: Database Migration

Confirm committed migrations preserve the household and identity boundaries.

Checklist:

- Generated SQL matches the reviewed Prisma schema checkpoint.
- Household-owned tables and indexes are present.
- Clerk provider subjects map to internal users through the unique provider/subject pair.
- No destructive statements are introduced without an explicit data-migration plan.
- Payment-source guardrails scan migration SQL.
- `pnpm guardrails:migration` passes.
- Production migration deployment is separately approved and uses committed migration files.
- The initial migration was approved, rehearsed, applied, and verified on 10 July 2026.
- `pnpm check:activation` rejects partial Clerk/Prisma activation and missing live credentials.

## Gate 9: Production Activation

Confirm the controlled activation sequence before enabling live modes.

- Clerk and Prisma modes change together.
- The Neon driver adapter is configured and the live activation check passes.
- The initial user is mapped by exact Clerk provider subject, never email alone.
- The initial household administrator membership is active and verified.
- Static demo data cannot appear as a fallback in live mode.
- Signed-out and unmapped-account states fail closed.
- Rollback returns both runtime modes to demo/static without deleting production data.
