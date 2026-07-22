# Private Source Storage Runbook

## Status

The private Cloudflare R2 bucket `family-life-admin-production` is provisioned in APAC with public access disabled. Production CORS permits only `https://lifeadmin.grovekind.com` to upload with `PUT`. Incomplete multipart uploads expire after one day.

The application storage boundary is complete and remains inactive until the production runtime receives bucket-scoped credentials.

## Required Environment Values

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME=family-life-admin-production`

Never expose these values through `NEXT_PUBLIC_*`, `EXPO_PUBLIC_*`, GitHub, logs, source records, or client responses.

## Bucket Controls

- Keep public development URLs and custom public domains disabled.
- Permit object access only through signed S3 requests.
- Scope the production token to object read/write for this bucket only.
- Keep preview/test credentials separate from production.
- Keep production CORS limited to the approved app origin and `PUT`.
- Do not permit wildcard production origins.
- Keep application retention rules authoritative; the provider lifecycle rule only aborts incomplete multipart uploads.

## Validation Flow

1. The authenticated household member requests an upload intent.
2. The server creates an opaque object key and a household-owned pending asset.
3. The client receives a ten-minute upload URL.
4. The server reads the quarantined object after upload.
5. Size, declared media type, magic bytes, and SHA-256 digest are checked.
6. Valid assets become ready; rejected assets are deleted immediately.
7. Reads use a five-minute URL created only after household authorization.
8. Authorized deletion removes the provider object and records a metadata-only activity event.

## Remaining Activation Dependency

Create one bucket-scoped R2 Object Read & Write token, then add its access key and secret to the Vercel production environment. Do not paste either credential into chat, GitHub, screenshots, or client-side configuration.
