# Family Life Admin Plan

## Current Objective

Set up the Phase 1 app foundation for Family Life Admin with static placeholder routes only.

## Product Summary

Family Life Admin is a private household admin app for shared household coordination. It focuses on manual creation and management of household tasks, reminders, shopping lists, bills and renewals as admin reminders, shared inbox items, source document/link references, members, comments, and activity history.

The MVP is a quick-rollout mobile-first web app. The schema should support future multi-household use, while the MVP UI may optimise for one primary household.

Approved product, architecture, and scope decisions are recorded in `docs/PRODUCT_DECISIONS.md`.

## Scope Guardrails

In scope:

- Household workspace
- Household members and simple roles
- Dashboard
- Shared inbox
- Tasks and reminders
- Shopping lists
- Bills and renewals as admin reminders
- Source document/link references
- Comments and activity history
- Basic settings

Out of scope:

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

## Staged Build Plan

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

## Immediate Next Step After Review

After Phase 1 review, choose whether to proceed to the household workspace phase. Do not add authentication, database schema, uploads, email forwarding, AI, OCR, voice capture, notifications, or native iOS until separately approved.
