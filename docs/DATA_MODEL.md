# Data Model

This is a proposed data model only. Do not create a database schema until the app foundation phase is approved.

## Data Model Principles

- Household-first ownership.
- Every core entity belongs to a household.
- Users access records through household membership.
- MVP roles are household admin and household member.
- Schema should allow future multi-household support.
- MVP UI may optimise for one primary household.
- Bills and renewals are admin reminders, not finance analytics.
- Source documents/links are references and must follow privacy rules.

## Phase 2 Static Mock Architecture

Phase 2 adds a typed static data layer before real persistence. This is not a Prisma schema and does not create migrations or a database connection.

The static layer includes:

- current household
- current household members
- current member
- household admin and household member roles
- household-scoped demo records using `householdId`
- member ownership placeholders such as `assignedMemberId` and `createdByMemberId`

This allows the app to validate household workspace structure and user experience before choosing production authentication, invite flow, database hosting, or persistence details.

## Proposed Core Entities

### User

Represents an authenticated person.

Fields:

- id
- name
- email
- avatarUrl
- createdAt
- updatedAt

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
- source documents/links
- comments
- activity events

### HouseholdMember

Connects a user to a household.

Fields:

- id
- householdId
- userId
- role: household_admin or household_member
- displayName
- status
- joinedAt
- createdAt
- updatedAt

### Invitation

Invitation-ready model for family sharing.

Fields:

- id
- householdId
- invitedEmail
- role
- status
- expiresAt
- acceptedAt
- createdAt
- updatedAt

## Proposed Work Entities

### InboxItem

Manual shared intake item.

Fields:

- id
- householdId
- title
- description
- status
- category
- assignedMemberId
- sourceDocumentId
- sourceLinkId
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
- priority
- dueAt
- assignedMemberId
- createdByMemberId
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
- linkedEntityType
- linkedEntityId
- assignedMemberId
- recurrenceRuleId
- createdByMemberId
- createdAt
- updatedAt

### RecurrenceRule

Reusable recurrence description for reminders and tasks.

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

## Proposed Shopping Entities

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
- checked
- assignedMemberId
- checkedAt
- createdAt
- updatedAt

## Proposed Bill And Renewal Entities

### BillOrRenewal

Admin reminder for a bill, renewal, policy, subscription, licence, service, or household obligation.

Fields:

- id
- householdId
- title
- provider
- type: bill or renewal
- status
- dueAt
- renewalAt
- notes
- assignedMemberId
- sourceDocumentId
- sourceLinkId
- createdByMemberId
- createdAt
- updatedAt

Allowed data:

- Provider
- Due date
- Renewal date
- Notes
- Status
- Source references
- Reminder metadata

Forbidden data:

- Generated/transcribed BPAY biller codes
- Generated/transcribed BSBs
- Generated/transcribed account numbers
- Generated/transcribed customer reference numbers
- Generated/transcribed payment reference values

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

## Proposed Source Entities

### SourceDocument

Reference to an original source document. Upload implementation is deferred until approved.

Fields:

- id
- householdId
- title
- sourceType
- storageKey
- originalFilename
- mimeType
- uploadedByMemberId
- createdAt
- updatedAt

### SourceLink

Reference to an external source.

Fields:

- id
- householdId
- title
- url
- notes
- createdByMemberId
- createdAt
- updatedAt

### SourceCropReference

Future model for user-confirmed source crops, including payment instruction references without transcribing values.

Fields:

- id
- householdId
- sourceDocumentId
- label
- cropMetadata
- confirmedByMemberId
- createdAt
- updatedAt

## Proposed Collaboration Entities

### Comment

Comment on a core household item.

Fields:

- id
- householdId
- entityType
- entityId
- body
- createdByMemberId
- createdAt
- updatedAt

### ActivityEvent

Audit-style household activity event.

Fields:

- id
- householdId
- actorMemberId
- entityType
- entityId
- eventType
- summary
- metadata
- createdAt

## Proposed Settings Entity

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

Access checks:

- Query by householdId and membership.
- Never fetch core records by id alone without household membership validation.
