# Email Forwarding Design

Email forwarding is approved as a private, review-first household intake channel.

## Goal

Allow a household member to forward school notices, appointment confirmations, utility notices, renewal messages, service correspondence, and bill documents into the shared household inbox.

Forwarding never creates an active task, reminder, bill, renewal, recurrence, or notification without an authorised member's confirmation.

## Addressing

- Issue one revocable, unguessable alias per household.
- Keep household ids, user ids, and email addresses out of the public alias.
- Allow alias rotation after suspected disclosure or abuse.
- Consider per-member aliases only after the household-level flow is stable.
- Display a copy action and clear forwarding instructions in Settings.

## Inbound Trust

- Use an inbound provider that signs webhooks.
- Verify signature, timestamp, expected host, and replay nonce before reading content.
- Treat From, Reply-To, subject, and display names as untrusted source metadata.
- Never use sender email as application identity or household authorization.
- Resolve the alias to exactly one active household server-side.
- Reject unknown, revoked, expired, malformed, oversized, or rate-limited input.

## Processing Flow

1. Verify provider webhook and idempotency key.
2. Resolve the household intake alias.
3. Record a metadata-only processing envelope.
4. Parse MIME structure with a maintained parser.
5. Normalize plain text and sanitized HTML.
6. Send attachments through the source-asset quarantine and validation pipeline.
7. Extract embedded text; apply OCR only to supported scans/images.
8. discard forbidden payment identifiers before extracted data can persist.
9. Create one bounded intake draft with safe candidate fields.
10. Notify an authorised member only that an item is ready to review.
11. Persist a household record only after confirmation.

## Safe Suggested Fields

- draft type;
- title;
- provider;
- due date;
- renewal date;
- short safe notes;
- proposed assignee;
- source email and attachment pointers;
- confidence and warnings.

No raw body, OCR text, attachment text, or payment details belong in activity summaries or notification payloads.

## Original Source

The original RFC 822 message may be retained as a private source asset after confirmation. Store a provider message-id digest for deduplication, not as a public identifier. Render email using sanitized text/HTML and never execute remote scripts or automatically load remote tracking pixels.

## Attachments

- Allow only documented file types and limits.
- Validate extension, declared MIME type, magic bytes, and digest.
- Quarantine until validation completes.
- Never execute macros, scripts, embedded files, or active PDF content.
- Require malware scanning before rich inline preview.
- Password-protected or unsupported content remains downloadable only under the approved safe policy or is rejected.

## Duplicate And Abuse Controls

- Idempotency on provider event id.
- Digest-based duplicate detection for messages and attachments.
- Per-alias and per-source rate limits.
- Maximum message, attachment, and aggregate daily sizes.
- Alias revocation and a household-visible intake status.
- Generic failure responses that reveal no household existence.

## Retention

- Unconfirmed messages and drafts expire after 30 days.
- Rejected content is deleted no later than 24 hours after validation.
- Confirmed original messages follow source-document retention.
- Temporary normalized/OCR text is deleted after safe-field projection.
- Deleting a source queues provider deletion and removes derived drafts/links according to shared-record rules.

## Bill And Payment Rules

The original forwarded bill may contain payment details because it is the private source of truth. Extracted structured records may contain only approved admin fields. Payment identifiers are discarded before persistence, logs, classification, notifications, search, or activity history.

Allowed action: **Open original email** or **View original document**.

Prohibited actions include copying extracted payment instructions, autofilling payment identifiers, or presenting Family Life Admin as the payment source.

## Provider Decision

Choose the inbound provider during implementation using:

- verified webhook support;
- Australian delivery and privacy requirements;
- attachment limits;
- retention controls;
- regional processing options;
- pricing at expected household volume;
- export and deletion support;
- operational reliability.

Keep provider-specific code behind an adapter so changing provider does not alter household services.
