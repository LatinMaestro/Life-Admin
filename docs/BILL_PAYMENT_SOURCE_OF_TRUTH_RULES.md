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
- Source email reference in a future phase
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

A future phase may support user-confirmed image crops or source references. These may point to the original source location of payment information, but must not convert that information into generated/transcribed stored values.

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

## AI/OCR Rules

AI and OCR are future phases. If approved later, they must not extract and store payment identifiers. Any payment-related detection must remain a pointer to a source document/crop/reference.

## Review Gate

Every bill, renewal, source document, AI, OCR, email forwarding, or upload-related change must pass the bill payment source-of-truth review gate before merge/release.
