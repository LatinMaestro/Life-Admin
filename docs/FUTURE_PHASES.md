# Future Phases

This document distinguishes the currently approved pre-store expansion from capabilities that remain deferred.

## Approved Current Scale-Up

The following are approved for implementation before client acceptance testing:

- self-service account and household onboarding;
- complete native workflow parity;
- advanced recurrence;
- private file uploads;
- user-initiated camera/document capture;
- household email forwarding;
- direct text extraction and OCR;
- bounded, reviewable intake classification;
- user-initiated voice capture and narrow speech-to-text;
- opt-in push notifications;
- automated security, authorization, privacy, end-to-end, and emulator QA;
- final web/native UI and client acceptance testing.

Canonical plans:

- `docs/PHASES_1_TO_16.md`
- `docs/AUTOMATED_INTAKE_ARCHITECTURE.md`
- `docs/RECURRENCE_AND_NOTIFICATION_DESIGN.md`
- `docs/MOBILE_APP_STORE_ROADMAP.md`

## Still Deferred

- general-purpose generative AI;
- autonomous creation or completion of household obligations;
- payment execution or payment-instruction generation;
- SMS reminders;
- background recording;
- unrestricted custom recurrence expressions;
- advanced permission roles beyond household admin/member;
- multi-household switching UI;
- background sync and offline writes;
- public sharing of source documents;
- finance features of any kind.

## Automation Boundary

Approved automation prepares drafts. It does not act autonomously.

- Email, upload, camera, OCR, and voice inputs enter a review queue.
- Safe-field projections use explicit output allowlists.
- Users confirm record type, fields, recurrence, assignment, and notification choices.
- Manual creation remains available.
- Original source documents remain the source of truth.
- Structured payment identifiers are discarded from extracted data.

## General-Purpose AI

A future proposal may consider broader language-model assistance only after the bounded OCR/classification release is operating safely. It would require separate approval, provider/privacy review, prompt and retention controls, adversarial payment-data testing, and a clear user-confirmation boundary.

## Multi-Household UI

The schema supports multiple household memberships. The UI continues to optimise for one primary household until switching behavior is separately designed and approved.

## Post-Launch Candidates

Possible later household-admin extensions include calendar integration, shared household templates, webhooks, widgets, wearables, and accessibility-driven platform integrations. Each requires its own scope and privacy review and must not introduce SpendGrove finance behavior.
