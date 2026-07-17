# Security And Privacy

Family Life Admin will contain private household information. Privacy and access control are product requirements, not optional polish.

## Privacy Principles

- Household data is private to authorised household members.
- Every core record must be household-scoped.
- Access must be based on household membership and role.
- Source documents and links should be treated as sensitive.
- The app should collect the minimum data needed for household admin workflows.
- Sensitive data should not appear in logs, analytics events, or unnecessary summaries.

## Household Access Rules

- A user may only view household data for households where they are a member.
- Household admin users can manage household settings and members.
- Household members can participate in household workflows according to approved role rules.
- Future multi-household support must prevent accidental cross-household data exposure.
- Production reads and writes must use a verified household access context; never query core records by id alone.

The implementation pattern is documented in `docs/ACCESS_CONTROL.md` and started in `src/lib/access-control.ts`.

## Source Document Rules

Source documents, source links, source emails, images, and source crops may contain sensitive information. The app should:

- Store only approved source metadata.
- Limit access to authorised household members.
- Avoid extracting payment identifiers during MVP.
- Avoid showing sensitive document text in previews unless explicitly approved.
- Avoid using document contents for AI, OCR, or classification until a later approved phase.
- Treat external links as references, not copied content.

## Bill And Payment Data Rules

Bills and renewals may track due dates and source references. They must not store generated or transcribed payment identifiers such as:

- BPAY biller codes
- BSBs
- Account numbers
- Customer reference numbers
- Payment reference values

Payment reminders should point users back to the original source email, PDF, link, image, or a user-confirmed crop/reference from the source document.

## Authentication And Authorisation

Clerk is the approved authentication provider. The SDK and server session mapping exist behind a disabled-by-default runtime mode; production authentication is not active yet.

Authentication rules:

- Resolve the trusted Clerk subject on the server.
- Map it to an internal User by the immutable provider/subject pair, never email alone.
- Do not store provider tokens, session cookies, or full identity payloads.
- Return no application session for signed-out or unmapped identities.
- Resolve verified household membership before constructing a `HouseholdAccessContext`.
- Keep application household roles in PostgreSQL rather than the identity provider.
- Accept household invitations only for the signed-in Clerk user's verified primary email.\n- Recheck the inviting admin's active household membership inside the database transaction.\n- Do not expose whether another email or household has an invitation.\n- Do not use email alone to relink an existing internal identity to a different provider subject.\n- Additional sign-in methods remain separately gated.

## Storage And Uploads

File uploads are deferred until explicitly approved. Before implementing uploads, approve:

- Storage provider
- Access policy
- Retention policy
- File size/type limits
- Deletion behavior
- Malware/scanning expectations, if any
- Backup and recovery expectations

## Audit And Activity

Activity history should help household members understand what changed without exposing unnecessary sensitive data. Activity events should describe actions, not reproduce private source document contents.
