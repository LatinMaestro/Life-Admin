# Bill Payment Source Of Truth Rules

This document defines strict rules for bills, renewals, and payment-related source references.

## Core Rule

Family Life Admin may remind a household that a bill or renewal is due. It must not become the source of payment instructions.

The source of truth for payment details is always the original source document, source email, source link, original image, or a user-confirmed crop/reference from that original source.

## Allowed Bill/Renewal Data

The app may store:

- Title
- Provider
- Type: bill or renewal
- Due date
- Renewal date
- Status
- Notes
- Assigned household member
- Source document reference
- Source link reference
- Source email reference
- Reminder date/time
- Activity history
- Comments

## Forbidden Stored Data

The app must not store generated or transcribed:

- BPAY biller codes
- BPAY customer reference numbers
- BSBs
- Account numbers
- Payment reference values
- Customer reference numbers
- Card numbers
- Payment tokens
- Any equivalent payment identifier

## User-Confirmed Source References

Approved upload and camera phases may support user-confirmed image crops or source references. These may point to the original source location of payment information, but must not convert that information into generated or transcribed stored values.

Allowed:

- "Open source document"
- "View user-confirmed payment section crop"
- "Open original email"
- "Open provider link"

Not allowed:

- "Pay using this generated BPAY code"
- "Copy extracted account number"
- "Autofill payment reference"
- "Show transcribed payment instructions"

## UI Rules

- Bill cards may show provider, due date, status, assignee, and source reference.
- Payment-related actions should be worded as "Open source" or "View original document".
- Do not label stored app data as payment instructions.
- Do not add finance dashboards, cashflow views, or spend analysis.

## Source Guardrail Automation

`pnpm guardrails:payment-source` scans app source and Prisma schema files for forbidden payment identifier language. Documentation files are intentionally excluded so they can continue to explain the rules clearly.

The automation is a backstop, not a replacement for review. Reviewers should still check bill, renewal, source reference, AI, OCR, email forwarding, and upload changes manually.

## Automated Intake, OCR, And Voice Rules

Email forwarding, uploads, camera capture, OCR, bounded classification, and voice capture are approved review-first intake channels.

- Original private sources may contain payment details because they remain the source of truth.
- Raw extraction output is temporary and must not become a durable product record.
- Forbidden payment values are discarded before persistence, classification, logs, search, notifications, drafts, or activity history.
- Detection may record only a category and count, never the matched value.
- Safe suggested fields are limited to title, provider, due date, renewal date, short notes, assignee, recurrence/reminder choices, and source pointers.
- Users must confirm every suggested record before it becomes active.
- Payment-related actions remain “Open source,” “View original document,” or equivalent source-navigation language.
- General-purpose generative AI and autonomous action creation remain unapproved.

## Review Gate

Every bill, renewal, source document, AI, OCR, email forwarding, or upload-related change must pass the bill payment source-of-truth review gate before merge/release.
