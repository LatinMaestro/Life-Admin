# Automated Intake Architecture

## Purpose

Family Life Admin may accept source documents, forwarded email, camera images, and voice only to help a household prepare reviewable administration drafts. Automation never bypasses household authorization, never creates an obligation without confirmation, and never turns Family Life Admin into a payment or finance system.

## Canonical Pipeline

1. **Receive** a user upload, camera image, forwarded message, or voice capture.
2. **Authenticate** the actor or verify the inbound channel and resolve exactly one household.
3. **Quarantine** source bytes in a private provider object with a server-derived key.
4. **Validate** size, media type, magic bytes, digest, and channel limits.
5. **Extract** embedded text; use OCR only when supported content has no usable text layer.
6. **Redact** forbidden payment identifiers before any extracted representation can persist.
7. **Classify** into a bounded draft type and safe candidate fields.
8. **Review** source, confidence, and safe fields in the app.
9. **Confirm** the intended record and notification/recurrence choices.
10. **Persist** only confirmed safe fields and a pointer to the original source.
11. **Delete** temporary text, audio, and processing artifacts on success, failure, or expiry.
12. **Audit** the action using metadata-only activity summaries.

Manual creation remains available at every point.

## Trust Boundaries

- Client-supplied household, actor, storage key, extraction result, or ownership identifiers are untrusted.
- Every request resolves the authenticated user and active household membership on the server.
- Inbound email aliases contain an unguessable token mapped server-side; they do not expose household ids.
- Provider webhooks require signature verification, timestamp tolerance, replay protection, and idempotency keys.
- Background jobs re-resolve household state before reading or writing.
- Signed source URLs are short-lived, operation-specific, and never stored as permanent public URLs.

## Safe Draft Contract

A draft may contain:

- proposed type: inbox, task, reminder, bill, renewal, or source reference;
- title;
- provider;
- due date;
- renewal date;
- short safe notes;
- proposed assignee;
- source asset or source message pointer;
- page/section reference;
- confidence and warnings.

A draft must not contain:

- payment routing or reference identifiers;
- copied payment instructions;
- bank/card/token values;
- full raw OCR or speech transcript;
- hidden model reasoning;
- an automatically active recurrence or notification schedule.

## Payment Redaction

Redaction runs before persistence, indexing, classification prompts, user-visible draft fields, logs, and activity events. It combines:

- strict field-name rejection;
- pattern detection and contextual labels;
- denylisted candidate keys;
- output-schema allowlisting;
- maximum-length and character-shape constraints;
- adversarial fixtures for Australian payment formats and equivalent international identifiers.

Detection records only a category and count. It never records the matched value. Original bytes remain accessible only as the household's private source of truth.

## Extraction Strategy

- Plain-text and HTML email bodies are normalized directly.
- Text PDFs use their embedded text layer.
- Scanned PDFs and images use OCR.
- Password-protected, corrupt, oversized, executable, or unsupported files fail safely.
- OCR output exists only in transient processing memory/storage and is deleted after safe-field projection.
- General-purpose generative content creation is not approved.
- Bounded classification may use deterministic rules or a narrowly configured provider behind the same allowlisted output contract.

## Storage Adapter

Application services use a provider-neutral object-storage interface:

- create upload intent;
- finalize and validate asset;
- issue short-lived read intent;
- quarantine or release asset;
- delete asset;
- verify provider deletion;
- list stale temporary assets for cleanup.

The production provider may be S3-compatible storage such as Cloudflare R2. Credentials remain server-only. Database records store provider-neutral object keys, digests, sizes, types, states, and retention dates, never public URLs.

## Retention Defaults

- Rejected uploads: delete as soon as validation completes, no later than 24 hours.
- Unconfirmed intake sources and drafts: expire after 30 days.
- Temporary OCR text and speech transcripts: delete immediately after safe projection, no later than 24 hours after terminal failure.
- Temporary voice audio: delete after draft confirmation/cancellation, no later than 24 hours.
- Confirmed original sources: retain until an authorized user deletes them or the household/account retention process applies.
- Provider backups and deletion queues follow the published privacy policy and are documented before activation.

## Email Intake

- One revocable intake alias per household, with optional per-member aliases later.
- Accept messages only after provider signature verification.
- Apply envelope, sender, attachment, message-size, rate, and duplicate controls.
- Store provider message identifiers as keyed hashes where practical.
- Do not trust From headers as identity; show sender metadata as unverified source context.
- Forwarded content always enters a review queue.

## Voice Intake

- Recording begins only after an explicit tap and permission grant.
- The UI visibly indicates recording and supports cancel/delete.
- Audio is encrypted in transit and temporary at rest.
- Speech-to-text is a narrow processing operation, not approval for general AI.
- Redaction and user confirmation are mandatory before record creation.

## Notification Boundary

Only confirmed household records and generated recurrence occurrences can schedule notifications. Intake arrival may notify an authorized member that a draft awaits review, but notification text must not quote source contents.

## Failure And Recovery

Each processing stage is a state transition with an idempotency key. Retries may repeat a stage but may not duplicate assets, drafts, records, occurrences, or notifications. Users see plain states: Uploading, Processing, Ready to review, Needs attention, or Removed.

## Observability

Allowed operational telemetry:

- opaque job id;
- household-scoped internal id where access is restricted;
- stage;
- duration;
- byte/page counts;
- provider status code category;
- redaction category counts;
- terminal outcome.

Never log source text, transcripts, filenames containing private data, email bodies, attachment contents, extracted field values, signed URLs, or notification payload details.
