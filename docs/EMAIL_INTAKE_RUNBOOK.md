# Household Email Intake Runbook

## Provider

Cloudflare Email Routing and one Email Worker are the selected inbound adapter because the Grovekind domain is already managed in Cloudflare. The application boundary remains provider-neutral: the worker sends a signed raw RFC 822 message to the private intake endpoint.

## Activation Values

Server-only application values:

- `EMAIL_ALIAS_SECRET`: at least 32 random characters, used to derive revocable addresses;
- `EMAIL_WEBHOOK_SECRET`: at least 32 random characters, shared only by the worker and app;
- `EMAIL_INTAKE_DOMAIN`: `intake.grovekind.com`.

Worker secret:

- `EMAIL_WEBHOOK_SECRET`, identical to the application value.

Worker variable:

- `INTAKE_WEBHOOK_URL=https://lifeadmin.grovekind.com/api/inbound/email`.

Never commit either secret.

## Cloudflare Setup

1. Enable Email Routing for `grovekind.com`.
2. Confirm Cloudflare's required MX and SPF DNS records.
3. Deploy `workers/email-intake/index.mjs`.
4. Add `EMAIL_WEBHOOK_SECRET` as an encrypted Worker secret.
5. Route the `intake.grovekind.com` catch-all to the Worker.
6. Keep outbound sending disabled; this worker receives only.
7. Test with fictional content and an approved PDF/image attachment.

## Processing Contract

- aliases are unguessable and can be rotated;
- the Worker signs timestamp, recipient, and SHA-256 message digest;
- the application rejects signatures older than five minutes;
- raw payloads are limited to 20 MB;
- duplicate message digests are idempotent;
- an alias accepts no more than 20 messages per hour;
- supported attachments use the private source validation pipeline;
- unsupported attachments create a neutral needs-attention state;
- content never enters logs or activity summaries;
- arrival creates only a review inbox item.

## Current Activation Dependencies

Cloudflare R2 must be enabled and private credentials configured before original messages or attachments can be retained. Email Routing also requires a one-time dashboard activation and DNS confirmation.
