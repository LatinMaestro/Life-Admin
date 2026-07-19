# MVP Scope

## MVP Goal

Deliver a private mobile-first household admin web app where family members can manually manage shared tasks, reminders, shopping lists, bills and renewals as admin reminders, source document/link references, comments, activity history, and household membership.

## In Scope

### Household Workspace

- Create and manage a household workspace.
- Store household-scoped records.
- Support future multi-household data ownership.
- Optimise MVP UI for one primary household.

### Family Members

- Household admin and household member roles.
- Member list and basic role display.
- Invitation-ready architecture, even if invitations are implemented later.

### Dashboard

- Today and upcoming items.
- Overdue tasks/reminders.
- Due soon bills and renewals.
- Active shopping lists.
- Recent inbox items.

### Shared Inbox

- Manual inbox item creation.
- Categorise or link inbox items to tasks, reminders, bills, renewals, lists, or documents.
- Basic statuses such as new, in progress, resolved, archived.

### Tasks And Reminders

- Manual task/reminder creation.
- Due dates.
- Assignees.
- Completion status.
- Basic recurrence model can be designed, but implementation should stay simple in MVP.

### Shopping Lists

- Multiple household shopping lists.
- List items.
- Checked/unchecked state.
- Optional notes and assignees.

### Bills And Renewals

- Provider, title, due date, renewal date, status, notes, assignee, and reminder metadata.
- Source document/link references.
- No financial analytics or payment-detail transcription.

### Source Documents And Links

- Source references for household admin items.
- MVP may begin with links/references before full upload implementation is approved.
- All source records must be household-scoped.

### Comments And Activity History

- Comments on core items.
- Activity events for created, updated, assigned, completed, reopened, archived, and commented actions.

### Basic Settings

- Household profile.
- Member/role visibility.
- Preference placeholders only where integrations are deferred.

## Out Of Scope For MVP

- Budgeting
- Bank imports
- Transaction tracking
- Spend categorisation
- Cashflow forecasting
- Tax reporting
- Property/loan features
- Net worth, investment, or account tracking
- Generated payment instructions
- Transcribed payment identifiers
- Email forwarding implementation
- AI extraction or classification
- OCR extraction
- Voice capture
- Native iOS
- Push notifications
- SMS reminders
- Production file uploads unless approved as a specific phase

## Scope Review Rule

If a feature starts to look like personal finance, document automation, AI intake, payment instruction handling, or native mobile work, pause and require explicit approval before implementation.


## Historical Scope Status

This file preserves the original manual-first web MVP boundary. The MVP was later implemented and validated. The user subsequently approved the pre-store expansion in `docs/PHASES_1_TO_16.md`, including native delivery, onboarding, advanced recurrence, private uploads/camera, email forwarding, direct text extraction/OCR, bounded reviewable classification, voice capture, and opt-in push notifications.

The expansion does not approve finance features, payment identifiers, payment execution, autonomous obligations, or general-purpose generative AI.
