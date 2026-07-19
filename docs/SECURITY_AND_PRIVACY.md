# Security And Privacy

Family Life Admin contains private household information. Privacy, authorization, safe automation, deletion, and source integrity are product requirements.

## Privacy Principles

- Household data is private to authorised household members.
- Every core record, asset, draft, job, token, and delivery belongs to a household or trusted user context.
- Collect and retain the minimum data needed for the confirmed workflow.
- Manual creation remains available.
- Automated intake creates drafts, not obligations.
- Sensitive content does not appear in logs, analytics, activity summaries, notification previews, or URLs.
- Original sources remain the source of truth.

## Household Access

- Resolve the trusted Clerk subject on the server.
- Map it to an internal User by immutable provider and subject, never email alone.
- Resolve active household membership before constructing a HouseholdAccessContext.
- Keep application roles in PostgreSQL.
- Scope every read, write, background job, asset, and signed URL by household.
- Recheck membership and target ownership inside write transactions and before background delivery.
- Fail closed for signed-out, unmapped, inactive, revoked, stale, or cross-household access.
- Never trust client-supplied household, actor, creator, role, object key, extraction, or notification ownership.

## First-User And Invitations

- Account creation alone grants no household data.
- First-household creation atomically creates the household and one active admin membership.
- Invitation acceptance requires the signed-in user's verified primary email.
- Recheck the inviting admin and invitation state transactionally.
- Requests are idempotent and do not reveal whether another email or household exists.
- The last active admin cannot leave, demote, or delete access without a safe ownership transition.

## Source Assets

Approved source assets include documents, source emails, images, user-confirmed crops, and temporary voice audio.

- Use server-derived opaque storage keys.
- Store assets privately with encryption in transit and provider encryption at rest.
- Use short-lived operation-specific signed URLs.
- Validate file size, declared type, magic bytes, and digest.
- Quarantine before preview or extraction.
- Never execute active document content, macros, scripts, or embedded programs.
- Require malware scanning before rich preview.
- Do not publish stable object URLs.
- Record metadata-only activity events.
- Queue and verify provider deletion.

## Default File Policy

Initial limits are conservative and may only expand after review:

- PDF, JPEG, PNG, and HEIC for direct upload/camera;
- RFC 822 email plus approved attachment types for forwarding;
- 15 MB per direct asset;
- 20 MB aggregate inbound email payload;
- reject archives, executables, scripts, macro-enabled documents, and unknown types.

Rejected assets are removed as soon as validation completes and no later than 24 hours.

## Automated Intake

The canonical pipeline is in `docs/AUTOMATED_INTAKE_ARCHITECTURE.md`.

- Verify input channel and resolve one household.
- Extract text directly when available.
- Use OCR only for supported scans/images.
- Keep raw extraction output temporary.
- Apply payment-data rejection before persistence, classification, logs, search, or user-visible drafts.
- Project only allowlisted safe fields.
- Require an authorised member to confirm type, fields, recurrence, assignment, and notification choices.
- Delete temporary text/audio after projection or terminal failure.

## Email

- Verify inbound provider signatures, timestamps, replay protection, and idempotency.
- Treat sender headers and content as untrusted.
- Use unguessable revocable aliases.
- Sanitize rendered HTML and block remote trackers by default.
- Apply rate, size, type, duplicate, and abuse controls.
- Never use sender email as authentication.

## OCR And Classification

- Embedded PDF/email text does not require OCR.
- OCR applies only to supported scanned PDFs and images.
- Raw OCR output is not a durable product record.
- Classification is bounded to inbox, task, reminder, bill, renewal, or source reference.
- Safe fields are title, provider, due/renewal date, short notes, proposed assignee, source pointer, confidence, and warnings.
- General-purpose generative output and autonomous action creation are not approved.

## Voice

- Ask for microphone permission only after an explicit user action.
- Display an unambiguous recording state.
- Never record in the background.
- Encrypt temporary audio and delete it after projection, cancellation, or expiry.
- Apply the same redaction and confirmation gates as document intake.
- Speech-to-text is a narrow approved processing operation, not approval for general AI.

## Bill And Payment Data

Bills and renewals may track provider, title, timing, status, notes, assignee, recurrence/reminder settings, and source references.

Structured extracted records must never include:

- BPAY biller or customer reference codes;
- BSBs or account numbers;
- customer/payment reference values;
- card numbers, tokens, or equivalent payment identifiers;
- copied payment instructions.

The original private source may contain those details. Users return to that source when payment is required.

## Notifications

- Notifications are opt-in and member-specific.
- Generic lock-screen previews are the default for sensitive item types.
- Payloads contain opaque deep-link identifiers, not source text.
- Recheck membership and item state before delivery.
- Respect quiet hours and timezone.
- Revoke tokens on sign-out, account deletion, provider rejection, or invalidation.
- Prevent duplicate delivery through deterministic event keys.

## Retention And Deletion

- Unconfirmed intake sources and drafts expire after 30 days.
- Rejected assets expire within 24 hours.
- Raw OCR text, speech transcripts, and temporary voice audio are deleted immediately after safe projection and no later than 24 hours after terminal failure.
- Confirmed sources remain until authorised deletion or household/account retention applies.
- Account and household deletion cover database rows, object storage, device tokens, pending jobs, drafts, and provider-side objects.
- Backup and provider retention are disclosed before activation.

## Logging And Observability

Allowed: opaque ids, stage, duration, counts, status categories, retry count, and terminal outcome.

Forbidden: source text, raw transcripts, filenames containing private data, email bodies, attachment contents, extracted values, payment matches, signed URLs, authentication tokens, and private notification text.

## Secrets And Providers

- Keep storage, email, OCR, speech, push, Clerk, and database credentials server-only.
- Use least-privilege credentials and separate production from preview/test.
- Rotate credentials after suspected exposure.
- Verify provider deletion, retention, regional processing, subprocessors, and breach controls before activation.
- Never place credentials, reviewer passwords, real household data, or real documents in GitHub.

## Audit

Activity history describes actions without reproducing source contents. Security-sensitive provider events use restricted operational logs rather than household-visible content.
