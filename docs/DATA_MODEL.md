# Data Model

This document defines the household-first data model direction for Family Life Admin.

## Data Model Principles

- Household-first ownership.
- Every core entity belongs to a household.
- Users access records through household membership.
- MVP roles are household admin and household member.
- Schema should allow future multi-household support.
- MVP UI may optimise for one primary household.
- Bills and renewals are admin reminders, not finance analytics.
- Source documents/links are references and must follow privacy rules.

## Production Prisma Schema Checkpoint

The production data-model checkpoint is `prisma/schema.prisma`. Eight reviewed PostgreSQL migrations are applied to production Neon: the initial household schema plus account deletion, advanced recurrence, secure source assets, household email intake, safe intake drafts, voice transcription, and private push notifications.

Current checkpoint includes:

- `User` with immutable external identity mapping
- `Household`
- `HouseholdMember`
- `Invitation`
- `InboxItem`
- `Task`
- `Reminder`
- `RecurrenceRule`
- `ShoppingList`
- `ShoppingListItem`
- `BillOrRenewal`
- `BillReminder`
- `SourceReference`
- `Comment`
- `ActivityEvent`
- `HouseholdSettings`
- `AccountDeletionRequest`
- `SourceAsset`
- `IntakeAlias`
- `IntakeEnvelope`
- `ExtractionJob`
- `IntakeDraft`
- `RecurrenceSeries`
- `RecurrenceOccurrence`
- `DeviceInstallation`
- `NotificationPreference`
- `NotificationDelivery`

Important boundaries:

- All eight migrations have been generated, reviewed, rehearsed, and applied to production.
- Production runtime uses Clerk-authenticated, database-backed household persistence.
- Invitation, membership administration, and first-user self-service onboarding are implemented.
- Source references may point to private source assets; object access remains household-scoped and short-lived.
- Recurrence, email intake, safe extraction drafts, voice drafts, device installations, and notification delivery are implemented within their review-first and retention boundaries.
- Bills and renewals do not include generated or transcribed payment identifier fields.

## Historical Phase 2 Static Mock Architecture

Phase 2 added a typed static data layer before real persistence. This is not a database connection.

The static layer includes:

- current household
- current household members
- current member
- household admin and household member roles
- household-scoped demo records using `householdId`
- member ownership placeholders such as `assignedMemberId` and `createdByMemberId`

This allowed early validation of household workspace structure and user experience. It is historical design evidence only; production does not use the static layer as a data fallback.

## Historical Phase 3 Static Role Model

Phase 3 represented MVP role behavior in TypeScript before production authentication and authorisation were implemented. This section is historical; current access control is enforced server-side.

The static role model includes:

- household admin and household member role definitions
- role capability labels for family and settings UI
- helper functions for static admin/member decisions
- member status and current member display in the household workspace

Production role enforcement is implemented through Clerk subject mapping, active membership resolution, household-scoped services, and server-side role checks.

## Core Entities

### User

Represents an authenticated person.

Fields:

- id
- name
- email
- avatarUrl
- authProvider
- authSubject
- createdAt
- updatedAt

Identity rules:

- authProvider and authSubject form a unique pair
- provider subjects map to internal users; they are not internal user or member ids
- email alone must not link accounts
- provider tokens and payloads are not stored

Relationships:

- many household memberships
- comments
- activity events

### Household

Represents a shared family/household workspace.

Fields:

- id
- name
- timezone
- createdAt
- updatedAt

Relationships:

- members
- inbox items
- tasks
- reminders
- shopping lists
- bills and renewals
- source references
- comments
- activity events
- settings

### HouseholdMember

Connects a user to a household.

Fields:

- id
- householdId
- userId
- role: household_admin or household_member
- status
- displayName
- initials
- joinedAt
- createdAt
- updatedAt

### Invitation

Household invitation model. Creation, acceptance, expiry, verified-email matching, and role safeguards are implemented.

Fields:

- id
- householdId
- invitedEmail
- role
- status
- createdByUserId
- expiresAt
- acceptedAt
- createdAt
- updatedAt

## Work Entities

### InboxItem

Manual shared intake item.

Fields:

- id
- householdId
- title
- description
- status
- category
- priority
- suggestedDestination
- routingReason
- triageSteps
- assignedMemberId
- sourceReferenceId
- createdByMemberId
- createdAt
- updatedAt

### Task

Household task.

Fields:

- id
- householdId
- title
- notes
- status
- stage
- priority
- dueAt
- checklist
- assignedMemberId
- createdByMemberId
- sourceReferenceId
- completedAt
- createdAt
- updatedAt

### Reminder

Household reminder, optionally linked to another item.

Fields:

- id
- householdId
- title
- notes
- remindAt
- status
- cadence
- linkedEntityType
- linkedEntityId
- assignedMemberId
- recurrenceRuleId
- createdByMemberId
- createdAt
- updatedAt

### RecurrenceRule

Reusable recurrence description for reminders.

Fields:

- id
- householdId
- frequency
- interval
- byDay
- startsAt
- endsAt
- createdAt
- updatedAt

## Shopping Entities

### ShoppingList

Shared household shopping list.

Fields:

- id
- householdId
- name
- status
- createdByMemberId
- createdAt
- updatedAt

### ShoppingListItem

Item within a shopping list.

Fields:

- id
- householdId
- shoppingListId
- label
- notes
- quantity
- category
- checked
- assignedMemberId
- createdByMemberId
- checkedByMemberId
- checkedAt
- createdAt
- updatedAt

## Bill And Renewal Entities

### BillOrRenewal

Admin reminder for a bill, renewal, policy, subscription, licence, service, or household obligation.

Allowed fields:

- id
- householdId
- title
- provider
- type: bill or renewal
- status
- dueAt
- renewalAt
- reminderWindow
- nextStep
- reviewChecklist
- notes
- assignedMemberId
- sourceReferenceId
- createdByMemberId
- createdAt
- updatedAt

Forbidden fields:

- Generated/transcribed BPAY biller codes
- Generated/transcribed BSBs
- Generated/transcribed account numbers
- Generated/transcribed customer reference numbers
- Generated/transcribed payment reference values
- Any equivalent payment identifier

### BillReminder

Reminder metadata for bill/renewal due dates.

Fields:

- id
- householdId
- billOrRenewalId
- remindAt
- status
- createdAt
- updatedAt

## Source Entities

### SourceReference

Reference to an original source. Approved private uploads, camera capture, forwarded email, and review-first intake may attach a household-scoped `SourceAsset`.

Fields:

- id
- householdId
- title
- kind
- label
- url
- externalRef
- reviewStatus
- sensitivity
- handlingNotes
- createdByMemberId
- createdAt
- updatedAt

The `externalRef` field is for non-sensitive source labels or external IDs only. It must not be used for generated/transcribed payment identifiers.

## Collaboration Entities

### Comment

Comment on a core household item.

Fields:

- id
- householdId
- entityType
- entityId
- body
- createdByUserId
- createdByMemberId
- createdAt
- updatedAt

### ActivityEvent

Audit-style household activity event.

Fields:

- id
- householdId
- actorUserId
- actorMemberId
- entityType
- entityId
- eventType
- summary
- metadata
- createdAt

Activity summaries should describe actions without reproducing sensitive source document contents.

## Settings Entity

### HouseholdSettings

Household-level preferences.

Fields:

- id
- householdId
- defaultTimezone
- dashboardPreferences
- createdAt
- updatedAt

## Indexing And Access Notes

Representative implemented indexes:

- householdId on all household-scoped entities
- householdId + status on operational lists
- householdId + dueAt/remindAt for dashboard queries
- householdId + userId on household memberships
- householdId + entityType + entityId on comments and activity

Access checks:

- Query by householdId and membership.
- Never fetch core records by id alone without household membership validation.
- Do not expose source references outside authorised household members.
- Do not log sensitive source metadata or private household content.


## Implemented Expansion Entities

These entities were approved and implemented in Phases 2-12 through scoped, reviewed migrations. `prisma/schema.prisma` and the eight migration directories are canonical for exact field names, relationships, constraints, and indexes; the summaries below state their privacy and ownership responsibilities.

### SourceAsset

Private object metadata for an uploaded document, camera image, original email, attachment, or temporary voice recording.

Fields:

- id
- householdId
- sourceReferenceId
- provider
- objectKey
- originalName
- mediaType
- byteSize
- sha256Digest
- state: pending, quarantined, ready, rejected, deleting, deleted
- purpose
- retentionUntil
- createdByMemberId
- createdAt
- updatedAt
- deletedAt

The objectKey is server-generated and provider-neutral. Public URLs, source contents, OCR text, and payment identifiers are not stored here.

### IntakeAlias

Revocable mapping for inbound household email.

Fields:

- id
- householdId
- aliasTokenHash
- state
- createdByMemberId
- createdAt
- revokedAt

### IntakeEnvelope

Metadata-only record for upload, email, camera, or voice processing.

Fields:

- id
- householdId
- channel
- providerEventKeyHash
- state
- sourceAssetId
- attemptCount
- expiresAt
- createdByMemberId
- createdAt
- updatedAt

### ExtractionJob

Tracks transient text/OCR/speech processing without storing raw extracted content.

Fields:

- id
- householdId
- intakeEnvelopeId
- mode: embedded_text, ocr, speech
- state
- pageCount
- confidenceBand
- redactionCategoryCounts
- startedAt
- completedAt
- expiresAt

### IntakeDraft

Reviewable safe-field projection.

Fields:

- id
- householdId
- intakeEnvelopeId
- proposedType
- title
- provider
- safeNotes
- dueAt
- renewalAt
- proposedAssignedMemberId
- sourceReferenceId
- confidenceBand
- warnings
- state: ready, confirmed, rejected, expired
- confirmedByMemberId
- expiresAt
- createdAt
- updatedAt

No raw transcript, OCR body, email body, or structured payment identifier is permitted.

### RecurrenceSeries

Household schedule template for confirmed tasks, reminders, bills, or renewals.

Fields:

- id
- householdId
- targetType
- targetId
- timezone
- frequency
- interval
- byDay
- dayOfMonth
- localTime
- startsOn
- endsOn
- occurrenceLimit
- state
- nextGenerationAt
- createdByMemberId
- createdAt
- updatedAt

### RecurrenceOccurrence

Generated idempotent occurrence.

Fields:

- id
- householdId
- recurrenceSeriesId
- scheduledFor
- localDate
- state
- overrideMetadata
- generatedAt
- completedAt

Unique constraint: recurrenceSeriesId plus scheduledFor.

### NotificationPreference

Per-member household notification choices.

Fields:

- id
- householdId
- memberId
- enabled
- allowedItemTypes
- quietHoursStart
- quietHoursEnd
- timezone
- previewMode
- createdAt
- updatedAt

### DeviceInstallation

Private household-scoped installation mapping for Expo push delivery.

Fields:

- id
- householdId
- userId
- memberId
- installationKeyHash
- expoPushToken
- platform
- state
- lastSeenAt
- createdAt
- updatedAt

Push tokens do not belong in household-visible data or activity history.

### NotificationDelivery

Idempotent delivery record.

Fields:

- id
- householdId
- memberId
- eventKey
- targetType
- targetId
- scheduledFor
- state
- attemptCount
- providerResultCategory
- deliveredAt
- createdAt
- updatedAt

## Expansion Indexes And Constraints

- householdId on every household-owned expansion entity
- unique aliasTokenHash
- unique provider plus providerEventKeyHash where present
- unique recurrenceSeriesId plus scheduledFor
- unique eventKey per notification delivery
- expiry indexes for temporary assets, envelopes, jobs, and drafts
- state plus nextGenerationAt for recurrence workers
- state plus scheduledFor for notification workers
- server-enforced foreign keys that cannot cross household ownership

## Expansion Deletion Rules

- deleting a source queues its assets and derived unconfirmed drafts for deletion;
- deleting a household revokes aliases, tokens in that household context, pending jobs, deliveries, and storage objects;
- raw extraction text and temporary audio are never durable database fields;
- activity events retain only safe action metadata;
- provider deletion is retried idempotently and reaches a terminal verified state.
