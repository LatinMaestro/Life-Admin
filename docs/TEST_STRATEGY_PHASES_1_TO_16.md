# Test Strategy: Phases 1-16

## Test Layers

### Static And Guardrail

- TypeScript strict checks for web and native.
- ESLint and production builds.
- Prisma schema validation and migration drift checks.
- Payment-source scanner across schema, web, API, native, workers, fixtures, and generated contracts.
- Dependency and permission inventory checks.
- File-type and route-boundary allowlists.

### Unit

Cover pure logic:

- recurrence expansion, month-end, timezone, and DST;
- safe-field schemas;
- payment-identifier rejection;
- MIME/address normalization;
- source type/magic-byte validation;
- retention dates;
- quiet hours;
- notification event keys;
- error mapping and beginner-facing copy.

### Service Integration

Run server services against isolated PostgreSQL:

- first-household creation and idempotency;
- invitation acceptance and last-admin safeguards;
- household-scoped CRUD;
- source-asset lifecycle;
- intake aliases and replay protection;
- extraction job transitions and expiry;
- draft confirmation;
- recurrence generation;
- notification scheduling and token revocation;
- account/household deletion cascades.

Every applicable service suite includes two households and both roles.

### API Contract

For each versioned route:

- signed out;
- unmapped user;
- inactive member;
- wrong household/record;
- member role;
- admin role;
- invalid body;
- idempotent retry;
- success;
- private no-store response;
- generic error without data leakage.

### Provider Contract

Adapters run against deterministic fakes in CI and provider sandboxes before activation:

- object storage;
- inbound email;
- OCR/text extraction;
- speech-to-text;
- push delivery;
- scheduler/worker trigger.

Fakes reproduce timeout, duplicate callback, partial response, invalid signature, deletion delay, rate limit, and provider rejection.

### Web End-To-End

Use a production-like authenticated test environment with fictional households:

- sign up and create household;
- accept invitation;
- create/edit/delete each core item;
- recurrence actions;
- upload/camera-equivalent browser selection;
- forwarded-email review;
- OCR draft confirmation/rejection;
- notification preferences;
- account deletion;
- cross-household URL and id tampering.

### Native Component And Journey

- screen/component tests for forms, validation, permissions, processing, errors, and accessibility labels;
- Android emulator smoke for sign-in, household, core CRUD, upload/camera, voice, recurrence, notification deep links, and deletion;
- iOS simulator smoke where platform credentials are not required;
- no production store account is needed before client acceptance.

## Test Data

- Use only fictional Rivera and Chen household fixtures.
- Include benign bill samples created specifically for testing.
- Include adversarial synthetic payment strings only in restricted test fixtures.
- Never use real household documents, emails, credentials, or device tokens.
- Generated screenshots must contain fictional identities and safe source URLs.

## Security Matrix

Required negative tests:

- object key guessing;
- signed URL replay/expiry;
- source id from another household;
- webhook replay and wrong signature;
- forged sender;
- attachment MIME mismatch;
- oversized/decompression payload;
- active content;
- OCR output containing forbidden payment values;
- prompt/output-schema escape where a bounded model is used;
- recurrence worker duplicate execution;
- notification after membership removal;
- deep link after account deletion;
- deletion while a job is processing.

## CI Shape

- Fast static/unit tests on every pull request.
- PostgreSQL service/API integration tests on every pull request.
- Web build and native typecheck on every pull request.
- Emulator and provider-sandbox suites on explicit release-candidate workflows.
- Vercel deployment is not required for pull-request verification.
- Phase 16 runs the full release workflow against the controlled client candidate.

## Evidence

Each phase records:

- commit and pull request;
- CI run;
- migration rehearsal where applicable;
- provider-sandbox evidence;
- screenshots or emulator artifacts for UI changes;
- unresolved risks;
- review-gate decision.

A green narrow test never proves a broader phase complete. The phase exit gate must map to evidence for every required journey and negative boundary.
