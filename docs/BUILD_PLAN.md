# Build Plan

## Phase 0: Documentation And Control Pack

Create and review the planning/control documentation. This phase contains no app code, package installs, database schema, authentication, uploads, or integrations.

Deliverables:

- Product source of truth
- MVP scope
- Review gates
- Definition of done
- Design system direction
- Security and privacy rules
- Data model proposal
- Future phase boundaries
- Bill/payment source-of-truth rules

Exit criteria:

- Documentation suite is reviewed.
- Product boundary is accepted.
- MVP scope is accepted.
- Decisions needed for app foundation are identified.

## Phase 1: App Foundation

Set up the mobile-first web foundation after approval.

Planned stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Auth-ready architecture
- Vercel deployment target

Exit criteria:

- App shell runs locally.
- Styling system is configured.
- Basic routing structure exists.
- Data/auth boundaries are documented before implementation.

## Phase 2: Household Workspace

Implement household-scoped workspace foundations.

Approved Phase 2 boundary:

- Static UI/data architecture only.
- Typed mock current household and current member models.
- Household-scoped demo records with member ownership placeholders.
- No production authentication, database connection, Prisma schema, migrations, invite flows, uploads, integrations, or native app work.

Exit criteria:

- Household ownership is represented in static app logic.
- MVP can optimise for one primary household.
- Schema remains compatible with future multi-household support.

## Phase 3: Members And Roles

Implement simple household roles.

Approved Phase 3 boundary:

- Static role behavior and role-aware UI only.
- Household admin and household member capabilities may be modeled in TypeScript.
- Family and settings pages may show static role labels, member status, and future access boundaries.
- No production authentication, authorisation enforcement, invite flow, database schema, migrations, or member mutation behavior.

MVP roles:

- Household admin
- Household member

Exit criteria:

- Members are visible within a household.
- Role behavior is documented and represented in static app logic.
- Admin-only actions are defined before production implementation.

## Phase 4: Dashboard

Create the mobile-first dashboard.

Approved Phase 4 boundary:

- Static dashboard refinement using existing household-scoped demo data.
- Household-level priority, assigned, inbox, shopping, bills/renewals, and activity summaries.
- No analytics, forecasting, automated intake, notifications, persistence, or finance dashboard behavior.

Exit criteria:

- Dashboard shows household-level today/upcoming/overdue summaries.
- Bills and renewals appear as admin reminders only.
- No finance analytics are introduced.

## Phase 5: Shared Inbox

Create manual shared inbox workflow.

Approved Phase 5 boundary:

- Static shared inbox triage using existing household-scoped demo data.
- Manual status, category, suggested destination, assignee, and source reference labels.
- No email forwarding, AI classification, OCR extraction, persistence, uploads, or automated routing.

Exit criteria:

- Household members can create and triage inbox items manually.
- Inbox items can reference relevant modules.
- Future email/AI intake remains deferred.

## Phase 6: Tasks And Reminders

Create task and reminder workflows.

Approved Phase 6 boundary:

- Static tasks and reminders workflow using existing household-scoped demo data.
- Manual task status, priority, assignee, due date, notes, and reminder cadence labels.
- No persistence, notification integrations, automated scheduling, or recurrence engine.

Exit criteria:

- Users can create, assign, complete, and review household tasks/reminders.
- Manual creation remains primary.
- Recurrence is limited to approved MVP behavior.

## Phase 7: Shopping Lists

Create household shopping lists and items.

Approved Phase 7 boundary:

- Static shopping workflow using household-scoped demo data.
- List items may show checked state, quantity, notes, owner/assignee labels, and creator placeholders.
- No persistence, barcode scanning, automated list generation, store integrations, uploads, or notifications.

Exit criteria:

- Lists are household-scoped.
- Items support checked state and basic notes.
- Mobile interaction is fast and uncluttered.

## Phase 8: Bills And Renewals

Create bill and renewal admin reminder workflows.

Approved Phase 8 boundary:

- Static bills and renewals workflow using household-scoped demo data.
- Bill and renewal records may show provider, timing, reminder window, notes, status, assignee, and source reference labels.
- No payment instruction generation, payment identifier storage/transcription, finance analytics, persistence, uploads, notifications, email forwarding, AI, or OCR.

Exit criteria:

- Bills/renewals track due dates, renewal dates, provider, status, notes, assignee, and source references.
- The app does not store generated/transcribed payment identifiers.
- Source-of-truth rules are visible in product and implementation review.

## Phase 9: Source Documents And Links

Implement approved source reference behavior.

Approved Phase 9 boundary:

- Static source reference library using household-scoped demo metadata.
- Source records may show title, source kind, label, created-by member, and source-reference actions.
- No file uploads, storage provider, external link validation, document previews, extracted document content, email forwarding, AI, OCR, or payment identifier transcription.

Exit criteria:

- References are household-scoped.
- Document/link privacy rules are enforced.
- Upload implementation only proceeds if separately approved.

## Phase 10: Comments And Activity History

Implement collaboration history.

Approved Phase 10 boundary:

- Static comments and activity history using household-scoped demo data.
- Comment records may show target item, body, author, date label, and target type.
- Activity records may show action summary, actor, and entity type without exposing sensitive source contents.
- No persistence, audit backend, notifications, email forwarding, AI, OCR, uploads, or auth enforcement.

Exit criteria:

- Core items support comments.
- Activity history records meaningful household actions.
- Sensitive source document details are not exposed unnecessarily.

## Phase 11: QA And Review

Run review gates and prepare for next phase.

Exit criteria:

- Scope review passes.
- Privacy review passes.
- Bill/payment source-of-truth review passes.
- Mobile usability review passes.
- Documentation remains current.
