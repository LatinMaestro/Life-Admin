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

The production data-model checkpoint is `prisma/schema.prisma`. The generated initial PostgreSQL migration is stored in `prisma/migrations/20260710103700_init/migration.sql`, but it has not been applied to a database.

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

Important boundaries:

- The initial migration has been generated and reviewed, but not applied.
- No production database connection has been configured and no migration command has been run against a live database.
- The app still renders from typed static demo data until persistence is wired in a later approved batch.
- The schema includes invitation-ready entities but does not implement invite flows.
- Source references are metadata/pointers only and do not implement uploads or document previews.
- Bills and renewals do not include generated or transcribed payment identifier fields.

## Phase 2 Static Mock Architecture

Phase 2 added a typed static data layer before real persistence. This is not a database connection.

The static layer includes:

- current household
- current household members
- current member
- household admin and household member roles
- household-scoped demo records using `householdId`
- member ownership placeholders such as `assignedMemberId` and `createdByMemberId`

This allowed the app to validate household workspace structure and user experience before choosing production authentication, invite flow, database hosting, or persistence details.

## Phase 3 Static Role Model

Phase 3 represents MVP role behavior in TypeScript before production authentication or authorisation exists. This is not access control enforcement.

The static role model includes:

- household admin and household member role definitions
- role capability labels for family and settings UI
- helper functions for static admin/member decisions
- member status and current member display in the household workspace

Production role enforcement must wait until authentication, membership queries, and database-backed access checks are approved and implemented.

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

Invitation-ready model for family sharing. This does not implement invite sending or acceptance yet.

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

Reference to an original source. Upload implementation is deferred until separately approved.

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

Likely indexes:

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
