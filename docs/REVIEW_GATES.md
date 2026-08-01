# Review Gates

Review gates protect the product boundary, household privacy, and implementation quality.

## Gate 1: Scope Boundary

- Household administration only.
- No personal-finance features.
- Bills and renewals remain source-linked admin reminders.
- Deferred capabilities require explicit approval.

## Gate 2: Household Ownership

- Every core record belongs to a household.
- Access requires active household membership.
- Read and write targets are rechecked inside the household.
- Cross-household leakage is not possible through page, API, query, or native state.
- Static data never silently replaces live production data.

## Gate 3: Roles And Permissions

- Admin and member abilities are clear.
- Admin-only settings and membership actions are enforced on the server.
- Native clients do not infer authorization from hidden controls.

## Gate 4: Privacy And Documents

- Sources remain private to authorized household members.
- Summaries expose only necessary metadata.
- Upload, camera, microphone, and notification behaviour stays within the approved Phases 5 and 10-12 scope and must pass Gates 12-15.
- Private API responses use no-store caching.

## Gate 5: Bill Payment Source Of Truth

- No generated or transcribed payment identifiers.
- Reminders return users to original source references.
- The guardrail scans web, API, native, schema, and migration files.

## Gate 6: Beginner Mobile Usability

- One obvious primary action per screen.
- Plain language and predictable navigation.
- Optional controls stay hidden until needed.
- Touch targets, text fitting, accessibility labels, loading, empty, error, and retry states are verified.

## Gate 7: Documentation

- Product behavior and status match documentation.
- Scope, security, data model, and future-phase decisions remain current.

## Gate 8: Database Migration

- SQL matches the reviewed Prisma schema.
- Household and identity boundaries are preserved.
- Destructive changes require an explicit migration and rollback plan.
- Production migration deployment is separately approved.

## Gate 9: Production Activation

- Clerk and Prisma live modes change together.
- Provider-subject identity and active membership are verified.
- Signed-out and unmapped accounts fail closed.
- Rollback does not delete production data.

## Gate 10: Mobile API

- API version and response contracts are explicit.
- Bearer authentication resolves through Clerk.
- Household, actor, creator, and ownership values come from server context.
- Inputs are validated and errors do not leak private data.
- Private responses are not cached.
- API tests cover unauthenticated, inactive, cross-household, and successful behavior.

## Gate 11: App Store And Google Play

- Native app provides real utility beyond a WebView.
- Privacy policy and support URLs are live.
- Account deletion paths satisfy current platform requirements.
- Store privacy/data-safety declarations match actual SDK and backend behavior.
- Review credentials or approved demo mode work.
- Screenshots use fictional data.
- Physical-device, accessibility, crash, and slow-network tests pass.
- Production domain, signing, identifiers, and store metadata are approved.


## Gate 12: Storage And Source Assets

- Object keys and signed URLs are server-derived and household-scoped.
- Size, type, magic-byte, digest, quarantine, malware, preview, retention, and deletion controls pass.
- No stable public source URL exists.
- Cross-household and expired-link tests pass.

## Gate 13: Automated Intake And OCR

- Inbound provider signatures, replay protection, rate limits, and idempotency pass.
- Raw email, OCR, and speech text remains temporary and absent from logs/activity.
- Output schemas allow only approved safe fields.
- Every result remains a draft until confirmation.
- Structured payment identifiers are discarded before persistence or classification output.

## Gate 14: Recurrence And Notifications

- Timezone, DST, month-end, one-occurrence, series-edit, pause, skip, and duplicate-run tests pass.
- Notifications are opt-in, respect quiet hours, use safe previews, and recheck access before delivery.
- Deep links fail safely after logout, access removal, or item deletion.

## Gate 15: Device Permissions

- Camera, microphone, and push permission prompts occur only after a clear user action.
- Denial, restricted, revoked, and retry states remain usable.
- No background recording or unrelated permission request exists.

## Gate 16: Client Acceptance Before Paid Release

- Final UI passes phone, tablet, desktop, accessibility, and beginner-usability review.
- A fictional-data client candidate is available without paid store enrollment.
- Client feedback is resolved and affected gates rerun.
- Explicit client approval is recorded before paid store-account operations, signed store uploads, or submission.
