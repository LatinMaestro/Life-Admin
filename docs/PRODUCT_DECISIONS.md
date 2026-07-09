# Product Decisions

This document records approved product, architecture, and scope decisions for Family Life Admin. Future work should treat these decisions as settled unless the user explicitly reopens them.

## Approved Decisions

1. Family Life Admin is a separate project from SpendGrove.
2. Family Life Admin is household/family admin, not personal finance.
3. SpendGrove remains the finance app.
4. MVP is mobile-first web first.
5. Native iOS is deferred until the web MVP is validated.
6. The app is household-first from the data model upward.
7. MVP roles are household admin and household member.
8. Manual creation is the MVP default.
9. Email forwarding is a future phase.
10. AI extraction/classification is a future phase.
11. OCR is a future phase.
12. Voice capture is a future phase.
13. Notifications are deferred until separately approved.
14. File uploads are deferred until separately approved.
15. Source links/references may be included before full uploads.
16. Bills and renewals are admin reminders only.
17. The app must not store generated or transcribed payment identifiers such as BPAY biller codes, BSBs, account numbers, CRNs, customer reference numbers, or payment reference values.
18. Payment-related reminders must point users back to original source documents, links, emails, images, or user-confirmed source crops/references.
19. MVP UI may optimise for one primary household while the schema remains future-ready for multi-household support.
20. The app should use calm, mobile-first, household-friendly UI patterns and avoid finance-dashboard language.
21. Phase 2 should validate static household workspace architecture before production authentication, database hosting, invite flow, or persistence details are selected.
22. Phase 2 should not add dynamic `/households/[householdId]` routes; it should use typed current-household state first.
23. After static MVP completion, the production layer begins with a Prisma/PostgreSQL schema checkpoint before live persistence, production authentication, migrations, invite flows, uploads, or integrations are wired into the app.

## Practical Effect

These decisions mean app foundation work should stay focused on a private household admin web app. Future agents should not reintroduce SpendGrove scope, finance dashboards, automated payment detail extraction, or deferred capabilities without explicit approval.

The current production path should proceed in scoped batches:

1. Prisma/PostgreSQL schema checkpoint.
2. Prisma package and validation setup.
3. Production authentication provider and session strategy.
4. Household membership enforcement.
5. Module-by-module persistence migration from static data.

## Deferred Until Separate Approval

- Email forwarding
- AI extraction/classification
- OCR
- Voice capture
- Notifications
- File uploads
- Native iOS
- Personal finance features of any kind
