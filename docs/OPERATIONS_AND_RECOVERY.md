# Operations And Recovery

## Purpose

This runbook covers privacy-preserving maintenance and provider failure recovery before client testing.

## Scheduled Jobs

Both internal jobs require an exact bearer `CRON_SECRET` of at least 32 characters and return private, non-cacheable responses.

- `POST /api/internal/notifications/dispatch` gathers due notification work, applies current access and preferences, and sends bounded batches.
- `POST /api/internal/maintenance/cleanup` expires temporary intake records, removes expired private assets, and prunes old delivery/device records.

The reviewed Cloudflare Worker in `workers/operations-scheduler` calls both endpoints every five minutes. It requires:

- encrypted Worker secret `CRON_SECRET`, identical to the Vercel production value;
- plain Worker variable `APP_BASE_URL=https://lifeadmin.grovekind.com`;
- the configured `*/5 * * * *` Cron Trigger.

The Worker sends no source content, logs no response bodies, requires HTTPS, and fails when either private operation rejects the request. Production scheduling remains disabled until the controlled client-test deployment is ready.

## Private Asset Recovery

- New uploads retain an expiry until the related review draft is confirmed.
- Voice audio expires after 24 hours and is deleted after successful projection.
- Expired pending, quarantined, rejected, deleting, and unconfirmed ready assets are removed in batches.
- A storage-provider deletion failure leaves the asset in `deleting` state with a retry time. It is not falsely reported as deleted.
- No object key, signed URL, raw source text, or provider error body is logged.

## Intake Recovery

- Processing claims are atomic and idempotent.
- A provider failure moves the envelope to `needs_attention`; a later explicit retry can claim it again.
- Expired unconfirmed drafts, extraction jobs, and envelopes become inaccessible.
- Confirming a draft removes the expiry from its retained original source.
- Confirmed household records remain intact when temporary processing metadata expires.

## Incident Checks

1. Disable the affected scheduler or provider credential.
2. Confirm household APIs still fail closed.
3. Inspect only counts, states, timestamps, and opaque identifiers.
4. Never copy source text or payment identifiers into tickets, logs, or chat.
5. Retry cleanup after provider recovery.
6. Rerun CI privacy, payment-source, authorization, scheduler, and migration gates before reactivation.
