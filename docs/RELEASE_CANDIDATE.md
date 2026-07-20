# Release Candidate

## Candidate Boundary

This document controls the single Phase 16 client-testing candidate. It is not an App Store or Google Play production release.

The candidate includes the completed household workspace, core records, advanced recurrence, private source uploads, camera capture, email forwarding, OCR and safe classification, voice capture, notification preferences, lifecycle recovery, and household-scoped web/native clients.

It never includes banking, budgeting, transaction tracking, spend analysis, cashflow, tax, property, loans, payment execution, or structured payment identifiers.

## Release Components

- Web: Next.js production deployment at `https://lifeadmin.grovekind.com`
- API: versioned household API on the same origin
- Authentication: Clerk production instance and custom Grovekind domain
- Database: Neon production PostgreSQL with reviewed migrations
- Android: EAS internal preview APK
- iOS: unsigned EAS simulator candidate before paid Apple enrolment
- Storage: private Cloudflare R2 bucket with public access disabled
- Email: Cloudflare Email Routing and one signed inbound Email Worker
- Document and speech processing: narrowly scoped Cloudflare Workers AI credentials
- Notifications: private preference and registration flow; platform delivery credentials remain a paid-release physical-device gate
- Operations: authenticated cleanup and notification dispatch endpoints

## Deployment Controls

1. Keep Vercel Git deployment disabled while candidate preparation is changing.
2. Pass the complete GitHub CI matrix.
3. Configure server-only provider values in the production environment.
4. Verify Cloudflare storage, email, and processing controls with fictional data.
5. Merge the final activation commit once.
6. Confirm exactly one new production Vercel deployment becomes Ready.
7. Verify the Grovekind domain points to that deployment.
8. Build one Android preview and one iOS simulator candidate from the same approved commit.
9. Record immutable commit, deployment, and EAS build references below.
10. Do not promote, submit, or upload to paid stores.

## Immutable Evidence

Populate after activation:

- Approved Git commit: pending
- Vercel production deployment: pending
- Android preview build: pending
- iOS simulator build: pending
- GitHub CI run: pending
- Production migration status: reviewed migrations applied; final status check pending
- Client approval: pending

## Provider Readiness

- Clerk production and Grovekind custom domain: configured
- Neon production database and migrations: configured
- Cloudflare zone and Email Routing: active
- Cloudflare R2: requires one-time account activation before provisioning
- R2 scoped credentials and CORS: pending R2 activation
- Inbound Email Worker and signed route: pending R2 and server secret configuration
- Workers AI scoped token: pending client-test provider configuration
- Internal scheduler secret and trigger: pending client-test provider configuration
- Apple/Google store accounts and production push credentials: deliberately deferred

## Rollback

If the candidate fails a privacy, access, migration, or provider gate:

1. stop the affected Worker or scheduler;
2. roll Vercel back to the previous Ready production deployment;
3. preserve production records and investigate on an isolated Neon branch;
4. revoke affected provider credentials;
5. rerun privacy, payment-source, authorization, migration, and release journeys before reactivation.
