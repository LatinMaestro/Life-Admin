# Production Activation Runbook

## Purpose

This runbook controls the first activation of live Clerk authentication and Neon persistence for Family Life Admin. The production database exists and the reviewed initial migration was applied on 10 July 2026. The public app must remain in `demo` / `static` mode until every gate below is complete.

## Non-Negotiable Boundaries

- Family Life Admin remains household admin, not personal finance.
- Every live read and write must use verified household membership.
- Clerk authenticates people; the application database owns households, members, and roles.
- External identity mapping uses the immutable Clerk provider subject, never email alone.
- Bills and renewals remain source-reference-only admin reminders.
- Never store, display, transcribe, or generate payment identifiers.
- Do not add uploads, email forwarding, AI, OCR, voice capture, notifications, or native iOS during activation.
- Never commit database or Clerk credentials.

## Runtime Modes

Only these pairs are supported:

- `demo` authentication with `static` persistence
- `clerk` authentication with `prisma` persistence

Partial activation is rejected by `pnpm check:activation`. The build runs this check before Next.js compilation.

## Activation Sequence

1. Provision Clerk for the Vercel project.
2. Configure the Clerk publishable key, secret key, and sign-in URL in the intended Vercel environments.
3. Configure the pooled Neon `DATABASE_URL` in the same environments.
4. Keep runtime modes set to `demo` and `static`.
5. Create or confirm the first person in Clerk and obtain the exact Clerk user subject.
6. Run the one-time initial household seed against the production database using secure operator environment values.
7. Confirm the internal user, household, settings, active administrator membership, and provider-subject mapping.
8. Run `pnpm check:activation:live` with the intended production environment.
9. Change both runtime modes together to `clerk` and `prisma`.
10. Deploy once and complete signed-out, signed-in, unmapped-account, household-isolation, mobile, and source-reference QA.
11. Roll back both modes to `demo` and `static` together if any activation gate fails.

## Initial Household Seed

Required secure environment values:

- `DATABASE_URL`
- `LIFE_ADMIN_INITIAL_CLERK_SUBJECT`
- `LIFE_ADMIN_INITIAL_USER_EMAIL`
- `LIFE_ADMIN_INITIAL_USER_NAME`
- `LIFE_ADMIN_INITIAL_HOUSEHOLD_NAME`

Optional values:

- `LIFE_ADMIN_INITIAL_HOUSEHOLD_TIMEZONE`
- `LIFE_ADMIN_INITIAL_MEMBER_NAME`

Validate without writing:

```bash
pnpm db:seed:initial
```

Apply after reviewing the target database and values:

```bash
pnpm db:seed:initial -- --apply
```

The seed is intentionally narrow and idempotent. It creates only the first internal user, household, settings, and active household administrator membership. It refuses email-only identity linking, conflicting identities, and automatic reactivation of inactive membership.

## Verification Gates

- Production migration status is clean.
- Runtime activation check passes.
- The first Clerk subject maps to exactly one internal user.
- The user has exactly one intended active household membership.
- Signed-out visitors reach sign-in.
- An authenticated but unmapped account reaches the access-pending state.
- A mapped administrator can read only the intended household.
- No static demo data appears in live mode.
- No payment identifiers appear in schema, logs, source references, or UI.
- Lint, guardrails, Prisma validation and generation, typecheck, and build pass.

## Rollback

Runtime rollback changes both modes together:

```text
FAMILY_LIFE_ADMIN_AUTH_MODE=demo
FAMILY_LIFE_ADMIN_PERSISTENCE_MODE=static
```

A rollback does not delete production data or reverse the migration. Investigate on an isolated Neon branch before changing production records.
