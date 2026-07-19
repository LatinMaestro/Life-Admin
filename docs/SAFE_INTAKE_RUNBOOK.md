# Safe Intake Runbook

## Scope

This release converts supported private household sources into review drafts. It does not create active obligations automatically. The original source remains authoritative and users confirm every suggested record.

## Processing Boundary

1. A verified private source is read using a short-lived server-side request.
2. Email text is normalized in memory. PDFs and supported images use the configured document conversion provider.
3. Sensitive routing, account, reference, card, and extracted monetary lines are removed before classification.
4. Only allowlisted draft fields and category counts are stored.
5. Raw email, document, OCR, or conversion text is not stored, logged, indexed, or added to activity.
6. A household member checks the draft against the original and confirms or dismisses it.
7. Unconfirmed processing records expire after 30 days.

## Cloudflare Document Conversion

The implementation uses Cloudflare Workers AI Markdown Conversion behind the provider-neutral DocumentExtractor contract. Configure these server-only values when activating document reading:

- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_AI_API_TOKEN

The token should be scoped only to the required Workers AI capability. Never expose it through a public environment variable. Conversion receives one validated file at a time and returns transient text. Provider output is untrusted and always passes through the protection and allowlist boundary.

Email text extraction does not require the document conversion provider. Email attachments do.

## Failure Behaviour

- A conversion failure leaves the original private source available.
- The intake envelope changes to Needs attention.
- No partial draft or raw extraction output is retained.
- Retrying the same source reuses its idempotent envelope and cannot create duplicate drafts.
- User-facing and operational errors remain generic and contain no source content.

## Review Gate

Before activation:

- Run the safe intake migration guard and adversarial policy tests.
- Verify cross-household asset and draft access is rejected.
- Confirm provider credentials are server-only.
- Confirm source URLs remain short-lived.
- Confirm logs contain no source text, converted text, filenames, signed URLs, or extracted values.
- Confirm bills and renewals only link back to the original source.
