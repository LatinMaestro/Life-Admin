# Phases 1-16: Client-Test Candidate Plan

This is the approved delivery sequence before paid Apple Developer or Google Play setup. Automatic Vercel Git deployments remain disabled during development and are re-enabled only when the Phase 16 client-test candidate is ready.

## Phase 1: Architecture And Control Pack

- Update scope, product decisions, security, data model, review gates, and definitions of done.
- Define provider-neutral boundaries for object storage, inbound email, text extraction, OCR, speech-to-text, recurrence, and push delivery.
- Define temporary processing, retention, deletion, redaction, and activity-history rules.
- Keep manual entry available for every automated intake workflow.

Exit gate: architecture documents agree, payment-source rules cover every intake channel, and no unresolved design decision blocks implementation.

## Phase 2: First-User Onboarding

- Add production web and native sign-up.
- Create a first household and admin membership transactionally.
- Accept an invitation using the signed-in user's verified email.
- Give users without membership a clear choice to create or join a household.
- Make retries idempotent and prevent duplicate households or memberships.

Exit gate: a new user can independently create a private household or join an invited household.

## Phase 3: Core Workflow Completion

- Add native item detail, edit, delete, and confirmation flows.
- Complete inbox category, status, assignment, source, and destination routing.
- Complete shopping-list create, rename, archive, restore, and item management.
- Make dashboard rows actionable and show actual due/overdue items.
- Place comments and activity in the context of their target item.

Exit gate: all core household workflows are usable without falling back to the web app.

## Phase 4: Advanced Recurrence

- Support daily, weekly, monthly, yearly, and bounded custom schedules.
- Model a recurrence series separately from generated occurrences.
- Support one-occurrence and whole-series edits, skip, pause, resume, and end.
- Generate occurrences idempotently in the household timezone.
- Reconcile overdue, completion, and notification behavior.

Exit gate: recurrence produces no duplicates and passes timezone and daylight-saving tests.

## Phase 5: Secure File Storage

- Add private household source assets behind a storage adapter.
- Use short-lived signed transfer URLs and server-derived household paths.
- Validate size, declared type, magic bytes, and file digest.
- Quarantine new files until accepted for preview or extraction.
- Add retention, deletion, orphan cleanup, and provider-failure recovery.

Exit gate: no source asset is public, cross-household accessible, executable, or orphaned indefinitely.

## Phase 6: Camera And Document Capture

- Add explicit camera and library selection flows.
- Ask for permission only after the user chooses capture.
- Support review, crop, retake, cancel, and upload confirmation.
- Preserve the original as the source of truth and avoid copied payment text.

Exit gate: capture is optional, accessible, and follows the same source-asset controls as uploads.

## Phase 7: Email Forwarding

- Issue unguessable household intake addresses.
- Verify inbound signatures and apply sender, size, type, rate, and duplicate controls.
- Parse MIME structure and retain the original message as a private source.
- Create a reviewable inbox draft; never create an obligation directly.
- Handle attachments through the secure source-asset pipeline.

Exit gate: forwarded email is authenticated, household-scoped, deduplicated, and review-first.

## Phase 8: Text Extraction And OCR

- Extract email body text and embedded PDF text directly.
- Use OCR only for scanned PDFs and supported images.
- Keep raw extraction output temporary and outside logs, analytics, and activity.
- Record processing state, confidence, page references, and redaction counts.
- Delete temporary extraction material after the draft is produced or processing fails.

Exit gate: supported documents produce reviewable safe fields without persisted raw OCR text.

## Phase 9: Controlled Classification

- Suggest inbox, task, reminder, bill, renewal, or source-reference drafts.
- Allow only title, provider, safe notes, due date, renewal date, assignee suggestion, and source pointer.
- Show confidence and source-page context without displaying payment instructions.
- Require explicit user confirmation before saving or scheduling.
- Keep general-purpose generative actions outside this phase.

Exit gate: every automated result is a draft and every persisted field is user-confirmed and policy-safe.

## Phase 10: Payment-Data Protection

- Detect forbidden payment identifiers before draft persistence.
- Drop forbidden spans rather than mask and retain them.
- Prevent forbidden values from logs, errors, prompts, notifications, search indexes, and activity metadata.
- Expand source guardrails and adversarial fixtures across email, OCR, uploads, and voice.

Exit gate: tests prove original sources remain usable while structured payment identifiers never enter application records.

## Phase 11: Voice Capture

- Add user-initiated recording or dictation with clear permission timing.
- Convert speech to a temporary transcript through a narrow adapter.
- Apply the same redaction and classification pipeline as document intake.
- Require review before saving and delete temporary audio/transcripts on completion or expiry.
- Never record in the background.

Exit gate: voice creates only reviewable household drafts and leaves no unnecessary audio behind.

## Phase 12: Push Notifications

- Register device tokens per user and installation.
- Add per-member channel, item-type, quiet-hour, and preview preferences.
- Schedule from confirmed records and recurrence occurrences only.
- Use generic lock-screen text by default and deep-link after authentication.
- Handle token rotation, revocation, retries, duplicate suppression, and sign-out cleanup.

Exit gate: notifications are opt-in, private by default, timely, and idempotent.

## Phase 13: Automated Quality And Security

- Add unit, integration, API, persistence, authorization, and isolation tests.
- Cover onboarding, invitations, CRUD, recurrence, intake, redaction, storage, deletion, and notifications.
- Add failure injection for provider timeout, retry, duplicate webhook, expired URL, and stale session.
- Run all existing finance-boundary and migration guardrails.

Exit gate: required test suites and static checks pass in CI from a clean checkout.

## Phase 14: End-To-End And Emulator QA

- Exercise release-critical web journeys against production-like services.
- Run Android emulator and iOS simulator smoke journeys where credentials allow.
- Verify permission prompts, deep links, offline/error/retry behavior, session recovery, and migrations.
- Record reproducible evidence and resolve all release blockers.

Exit gate: complete journeys pass outside isolated unit tests.

## Phase 15: Final UI And Accessibility

- Review every web and native screen for one primary action and plain language.
- Complete phone, tablet, desktop, keyboard, screen-reader, contrast, touch-target, and dynamic-text checks.
- Polish loading, empty, success, validation, permission, processing, and failure states.
- Remove redundant controls and implementation-facing copy.

Exit gate: the product is coherent, calm, and usable by beginner app users.

## Phase 16: Client App Testing

- Re-enable a single controlled Vercel deployment for the approved web candidate.
- Produce an installable Android preview and an iOS simulator candidate where practical.
- Seed fictional end-to-end household scenarios.
- Provide a concise client acceptance checklist covering all approved features.
- Resolve feedback, rerun affected gates, and obtain explicit client approval.

Exit gate: the client approves the UI and complete app workflow. Paid store-account work may begin only after this gate.

## Permanent Boundaries

Family Life Admin remains household administration. SpendGrove remains finance. Do not add banking, budgets, transactions, spend analysis, cashflow, tax, property, loans, investment tracking, payment execution, or structured payment identifiers. Bills and renewals remain reminders that return users to original sources.
