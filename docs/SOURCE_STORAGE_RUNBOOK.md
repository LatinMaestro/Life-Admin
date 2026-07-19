# Private Source Storage Runbook

## Status

Phase 5 uses a provider-neutral private object-storage boundary with a Cloudflare R2 implementation. The code remains inactive until the production environment has the required server-only values.

## Required Environment Values

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

Never expose these values through `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`, GitHub, logs, source records, or client responses.

## Bucket Controls

- Keep public development URLs and custom public domains disabled.
- Permit object access only through signed S3 requests.
- Scope the production token to object read/write for the single Family Life Admin bucket.
- Keep preview/test credentials separate from production.
- Configure browser CORS only for the approved app origins and `PUT`.
- Do not permit wildcard production origins.
- Keep lifecycle cleanup in the application because retention depends on confirmation state.

## Initial CORS Origins

- `https://lifeadmin.grovekind.com`
- the single controlled Vercel client-test origin when Phase 16 begins;
- local development origins only in a separate non-production bucket.

## Validation Flow

1. The authenticated household member requests an upload intent.
2. The server creates an opaque object key and a household-owned pending asset.
3. The client receives a ten-minute upload URL.
4. The server reads the quarantined object after upload.
5. Size, declared media type, magic bytes, and SHA-256 digest are checked.
6. Valid assets become ready; rejected assets are deleted immediately.
7. Reads use a five-minute URL created only after household authorization.
8. Authorized deletion removes the provider object and records a metadata-only activity event.

## Current Activation Dependency

R2 must be enabled once in the Cloudflare dashboard before the bucket and scoped credentials can be provisioned. Until then, source links continue to work and private file uploads fail closed with a generic configuration message.
