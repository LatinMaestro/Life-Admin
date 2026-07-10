# Authentication Provider Decision

## Status

Approved on 10 July 2026. The Clerk SDK, conditional provider wrapper, and Next.js 16 proxy foundation are being added behind an explicit runtime mode. Production sign-in is not active.

Static demo mode remains the default until Clerk environment variables, database environment, identity mapping, migrations, and household membership enforcement are ready as one controlled rollout.

## Recommendation

Use Clerk as the production identity and session provider for the Family Life Admin web MVP.

Clerk is the best fit for the current product because it provides:

- first-class Next.js App Router support
- server-side session helpers and route protection
- prebuilt sign-in UI suitable for a quick mobile-first rollout
- a Vercel Marketplace integration with environment variable provisioning
- a smaller implementation burden than an enterprise identity platform

Official references:

- [Clerk Next.js SDK](https://clerk.com/docs/reference/nextjs/overview)
- [Clerk sign-in component](https://clerk.com/docs/nextjs/reference/components/authentication/sign-in)
- [Clerk middleware](https://clerk.com/docs/reference/nextjs/clerk-middleware)
- [Clerk on the Vercel Marketplace](https://clerk.com/changelog/2025-07-14-vercel-marketplace-integration)

## Alternatives Considered

### Auth0

Auth0 is mature and has a native Vercel integration, but its enterprise identity and organisation features are more than the household MVP requires. It remains a reasonable alternative if enterprise SSO or complex identity federation becomes a real requirement.

Reference: [Auth0 Vercel integration](https://auth0.com/docs/customize/integrations/integrate-with-vercel)

### Descope

Descope offers configurable passwordless and visual authentication flows. That flexibility is useful for products with unusual onboarding requirements, but Family Life Admin currently benefits more from a direct, conventional sign-in path and a smaller operating surface.

Reference: [Descope Next.js documentation](https://docs.descope.com/getting-started/nextjs)

## Identity Boundary

Clerk should authenticate people only. Family Life Admin remains authoritative for households, memberships, and roles.

Rules:

- Clerk user IDs must not be used as household member IDs.
- Household admin and household member roles remain in PostgreSQL.
- Clerk organisations must not become the household source of truth for the MVP.
- An authenticated Clerk subject must resolve to an internal User record before household access is granted.
- Membership must be verified for the selected household on every protected server read or write.
- Client-provided household or member IDs are never trusted without server verification.
- The existing AuthSession and HouseholdAccessContext contracts remain the application boundary.

## User Mapping

The Prisma schema checkpoint includes an immutable external identity mapping on User:

- authProvider
- authSubject

The pair is unique. Account linking must use the provider subject, not email alone. Email can remain profile and contact data but must not silently merge accounts.

Do not store provider access tokens, refresh tokens, session cookies, or identity-provider payloads in application tables or logs.

## Initial Sign-In Experience

Recommended MVP posture:

- email verification code as the primary sign-in method
- one active account per person
- no public household creation after sign-in until onboarding is separately designed
- no invitation sending or acceptance in the first auth batch
- no SMS sign-in
- no social sign-in until separately enabled and reviewed
- clear signed-out, loading, access-denied, and no-household states

The sign-in screen should remain calm and household-focused. It should not expose internal role, database, or persistence terminology.

## Route And Session Rules

When implementation is approved:

1. Keep only sign-in and required provider callback assets public.
2. Protect all household workspace routes on the server.
3. Resolve the trusted provider subject from the server session.
4. Map the subject to the internal User.
5. Resolve an active HouseholdMember for the selected or primary household.
6. Construct HouseholdAccessContext only after membership verification.
7. Pass that context to read models and persistence adapters.
8. Fail closed when session, user mapping, or membership is missing.

Production must not fall back to the demo access context. Static demo mode may remain available for explicit development and preview use, but production auth mode must fail closed.

## Privacy And Security Requirements

- Use provider-hosted or provider-supported sign-in flows; do not handle passwords directly.
- Keep secret keys server-only.
- Pass only the minimum user fields needed by client components.
- Do not expose full provider user objects to the browser.
- Do not log session tokens, source-reference metadata, private household content, or provider payloads.
- Rotate credentials if they are ever exposed.
- Apply secure cookie and redirect defaults from the provider SDK.
- Review account deletion, email changes, and provider account recovery before production launch.

## Implementation Sequence After Approval

1. Approve Clerk and the initial email-code sign-in posture. Done.
2. Provision the Clerk integration and environment variables for development, preview, and production.
3. Add the external identity mapping to the Prisma schema. Done at schema checkpoint; the first reviewed migration remains pending.
4. Add the Clerk SDK, provider/proxy boundary, protected workspace layout, and sign-in page. Done at inactive code checkpoint.
5. Implement getCurrentAuthSession() using a trusted provider session and internal user lookup. Done at code checkpoint; activation remains pending.
6. Enforce household membership through the existing server access resolver. Done for server read models at code checkpoint.
7. Add explicit onboarding states without implementing invitations. Unmapped-account state done.
8. Validate signed-out, signed-in, wrong-household, inactive-member, and missing-membership behavior.
9. Complete privacy, security, mobile, CI, and production deployment review gates.

## Not Included In The Foundation Batch

The dormant SDK foundation does not implement:

- database connection or migrations
- user onboarding
- household creation
- invite flows
- file uploads
- email forwarding
- AI, OCR, or voice capture
- notifications
- native iOS
- finance features
