# Specification Source Of Truth

This document is the canonical product direction for Family Life Admin.

## Product Identity

Family Life Admin is a private family and household admin app. It gives household members a shared workspace for recurring life logistics: tasks, reminders, shopping lists, bills and renewals as admin reminders, source documents/links, comments, and activity history.

It is not SpendGrove and must not reuse SpendGrove product scope. It is not a budgeting, spend tracking, transaction, cashflow, tax, property, loan, or personal finance analytics product.

## Target Experience

The first version should be a quick-rollout mobile-first web app. A household member should be able to open the app on their phone and quickly see what needs attention, add a reminder, check off shopping items, record a bill due date, or attach a reference link/document.

The app should feel calm, practical, and private. It should support repeated daily use rather than a marketing-style experience.

## MVP Modules

1. Household workspace
2. Family members
3. Dashboard
4. Shared inbox
5. Tasks and reminders
6. Shopping lists
7. Bills and renewals
8. Source documents/links
9. Comments and activity history
10. Basic settings

## Household-First Rules

- Every core record belongs to a household.
- A user accesses household data through household membership.
- MVP roles are household admin and household member.
- The data model should support future multi-household membership.
- MVP UI may optimise around one primary household.

## Manual-First Rules

Manual creation is the MVP default. Users manually create tasks, reminders, shopping lists, bills, renewals, inbox items, comments, and source references.

Email forwarding, secure uploads/camera, direct text extraction and OCR, bounded classification, voice capture, advanced recurrence, push notifications, and native distribution were later explicitly approved for Phases 1-16. These features remain review-first, household-scoped, and subordinate to manual creation. General-purpose generative AI remains deferred.

## Bills And Renewals

Bills and renewals exist to track household admin obligations. They may include:

- Provider
- Title
- Due date
- Renewal date
- Status
- Notes
- Source document or source link references
- Reminder metadata
- Assignee

They must not include generated or transcribed payment identifiers such as BPAY biller codes, BSBs, account numbers, customer reference numbers, or payment reference values. Any payment action should point back to the original user-provided source email, PDF, link, image, or user-confirmed crop/reference.

## Technology Direction

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Vercel deployment target
- Auth-ready architecture
- Mobile-first web first
- Native iOS later


## Approved Pre-Store Expansion

The original MVP has been validated and expanded through the client-test plan in `docs/PHASES_1_TO_16.md`. Automated channels may prepare drafts only. An authorised household member confirms the record, recurrence, assignment, and notification settings. Original sources remain private and structured payment identifiers never become application data.
