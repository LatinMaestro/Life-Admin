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

The architecture should be auth-ready from the app foundation phase, but authentication is not implemented during this documentation-only pass.

Before implementation, approve:

- Auth provider
- Session strategy
- Invite flow
- Role enforcement approach
- Passwordless/social login requirements, if any

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
