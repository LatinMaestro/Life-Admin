# Household Email Intake Runbook

## Provider

Cloudflare Email Routing and one Email Worker are the selected inbound adapter because the Grovekind domain is managed in Cloudflare. The application boundary remains provider-neutral: the Worker sends a signed raw RFC 822 message to the private intake endpoint.

Email Routing for `grovekind.com` is active and healthy. Existing Grovekind mailbox rules remain unchanged. The reviewed `family-life-admin-email-intake` Worker is staged with its webhook URL, with public development URLs and previews disabled.

## Activation Values

Server-only application values:

- `EMAIL_ALIAS_SECRET`: at least 32 random characters, used to derive revocable addresses;
- `EMAIL_WEBHOOK_SECRET`: at least 32 random characters, shared only by the Worker and app;
- `EMAIL_INTAKE_DOMAIN=intake.grovekind.com`.

Worker secret:

- `EMAIL_WEBHOOK_SECRET`, identical to the application value.

Worker variable:

- `INTAKE_WEBHOOK_URL=https://lifeadmin.grovekind.com/api/inbound/email`.

Never commit either secret.

## Cloudflare Setup

1. In Email Routing settings for `grovekind.com`, add the `intake` routing subdomain.
2. Wait for Cloudflare to report the subdomain ready and confirm its required DNS records exist.
3. Add `EMAIL_WEBHOOK_SECRET` to `family-life-admin-email-intake` as an encrypted Worker secret.
4. Keep the configured webhook URL as a plain Worker variable.
5. Route the `intake.grovekind.com` catch-all to the Worker.
6. Keep outbound sending disabled; this Worker receives only.
7. Test with fictional content and an approved PDF/image attachment.

Do not enable an apex-domain catch-all for this app. It could capture addresses intended for other Grovekind products.

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

## Remaining Activation Dependencies

The private R2 bucket, apex Email Routing, and inert Worker are ready. The account owner must add the `intake` routing subdomain and create the server secrets before the Worker can be activated. Vercel must receive the matching server-only values before the single client-test deployment.
