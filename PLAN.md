# Family Life Admin Plan

## Current Objective

Continue the production persistence path while Vercel activation review is deferred. Manual shared-inbox, task, reminder, shopping-list, and shopping-item workflows now use household-scoped writes and beginner-friendly mobile controls. Core pages have one primary action, shorter plain-language copy, compact summaries, and optional forms hidden until needed. The production Neon schema is migrated, Clerk and Neon are connected to Vercel, Prisma 7 uses the Neon runtime adapter, and the first provider-mapped internal user has one active household administrator membership. Vercel runtime modes are staged as Clerk and Prisma together, pending a deployment from the latest main commit and signed-out, signed-in, household-isolation, mobile, and privacy QA. Clerk development keys are intentionally used for this staging checkpoint; production Clerk keys remain blocked on an approved custom domain and DNS configuration. Uploads, email forwarding, AI, OCR, voice capture, notifications, native iOS, payment identifier storage, and finance features remain absent.

## Product Summary

Family Life Admin is a private household admin app for shared household coordination. It focuses on manual creation and management of household tasks, reminders, shopping lists, bills and renewals as admin reminders, shared inbox items, source document/link references, members, comments, and activity history.

The MVP is a quick-rollout mobile-first web app. The schema should support future multi-household use, while the MVP UI may optimise for one primary household.

Approved product, architecture, and scope decisions are recorded in `docs/PRODUCT_DECISIONS.md`. The current static MVP checkpoint is recorded in `docs/STATIC_MVP_COMPLETION_REVIEW.md`.

## Scope Guardrails

In scope for the production foundation path:

- Household-first Prisma/PostgreSQL schema
- Future authentication-ready user and membership model
- Household admin and household member roles
- Household access-control helpers
- Server-side household access resolver
- Demo-only access context for static repository reads
- Auth/session contracts and approved dormant Clerk provider foundation
- Static and Prisma persistence adapters behind a shared contract
- Static comments through the adapter contract
- Server-only adapter selection that defaults to static mode
- Dashboard, module, and workspace read-model foundations behind the adapter boundary
- Shared read-model summary UI component
- App shell and all current pages migrated to the read-model path
- CI enforcement preventing direct raw demo-data imports in app pages and shared components
- Static demo data to future seed snapshot mapping
- Module-by-module persistence migration after schema validation
- Source references as metadata/pointers only
- Bills and renewals as admin reminders only

Out of scope until separately approved:

- Budgeting
- Bank imports
- Transaction tracking
- Spend analytics
- Cashflow forecasting
- Tax reporting
- Property or loan management
- Payment instruction generation
- Email forwarding implementation
- AI extraction
- OCR extraction
- Voice capture
- Native iOS implementation
- Notification integrations
- File uploads or source storage
- Generated or transcribed payment identifiers

## Completed Static MVP Path

1. Documentation/control pack
2. App foundation
3. Household workspace
4. Members and roles
5. Dashboard
6. Shared inbox
7. Tasks and reminders
8. Shopping lists
9. Bills and renewals
10. Source documents/links
11. Comments and activity history
12. QA and review

## Production Foundation Path

1. Prisma/PostgreSQL schema and initial production migration. Done; applied to Neon on 10 July 2026.
2. Household access-control foundation. Done.
3. Persistence repository contracts. Done.
4. Prisma package, lockfile, and schema validation setup. Done.
5. Prisma client boundary and read-only adapter foundation. Done.
6. Household access resolver. Done.
7. Auth/session contract boundary. Done.
8. Seed/demo migration bridge. Done.
9. Static persistence adapter. Done.
10. Server persistence adapter selector. Done.
11. Demo access context for static repository reads. Done.
12. Dashboard read-model foundation. Done.
13. Module read-model foundations. Done.
14. Shared read-model summary UI component. Done.
15. Sources page read-model migration. Done.
16. Static comments adapter support. Done.
17. Activity page read-model migration. Done.
18. Inbox, tasks, lists, and bills page read-model migration. Done.
19. Workspace read model and Dashboard, Family, Settings, and app shell migration. Done.
20. Authentication provider and session strategy. Clerk provisioned and linked; SDK, session mapping, sign-in, and protected workspace checkpoints done.
21. Household membership enforcement. Server read-model checkpoint done; live mutation enforcement pending.
22. Clerk signed-out and unmapped-account access states. Done; staging activation pending deployment QA.
23. Audit remaining direct static dependencies and keep them behind approved demo boundaries. Done.
24. Persist shared inbox writes. Done for manual item creation; triage/status mutation remains a later refinement.
25. Persist tasks and reminders writes. Done for manual creation, completion, and reopening.
26. Persist shopping list writes. Done for list/item creation and checked-state updates.
27. Persist bills and renewals writes with source-of-truth guardrails. Done for manual source-first creation, completion, and reopening.
28. Persist source references as metadata/pointers. Done for manual https links and original-location references.
29. Persist comments and activity history. Done for item comments and automatic mutation activity.
30. Production QA and privacy review. Code, scope, privacy, and beginner-usability review done; authenticated Vercel browser QA pending.
31. Controlled Clerk/Prisma staging activation. Environment and seed gates done; latest-main deployment and QA pending.
32. Custom production domain, Clerk production keys, and controlled identity remap. Pending separate domain approval.

## Immediate Next Step

Continue small daily-action refinements behind the same review branch. Complete authenticated Vercel browser QA when access resumes, then merge and verify the controlled activation before starting any deferred feature phase.
