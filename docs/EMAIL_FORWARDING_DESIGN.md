# Email Forwarding Design

Email forwarding is a future phase. It is not part of the documentation-only setup pass and should not be implemented during MVP without explicit approval.

## Future Goal

Allow household members to forward relevant household admin emails into Family Life Admin so the household can triage them from the shared inbox.

Examples:

- School notices
- Renewal reminders
- Appointment confirmations
- Utility notices
- Insurance renewals
- Household service emails

## Intended Flow

1. A household receives a forwarding address.
2. A household member forwards an email to that address.
3. The app records the original email as a source reference.
4. The app creates a draft inbox item.
5. A household member reviews and confirms the item.
6. The household member manually links it to a task, reminder, bill, renewal, shopping list, or source reference.

## Privacy Rules

- Forwarded emails are private household documents.
- Email content must be visible only to authorised household members.
- Email metadata and attachments must be treated as sensitive.
- Logs must not expose sensitive email content.

## Bill And Payment Rules

Forwarded bills or renewal emails must not result in generated/transcribed payment identifiers. The app may record:

- Source email reference
- Provider
- Due date
- Renewal date
- Status
- Notes
- Reminder metadata

Payment details should remain in the original email or approved user-confirmed source reference.

## Future Decisions Needed

- Email provider/inbound processing service
- Forwarding address format
- Spam and abuse controls
- Attachment handling
- Retention policy
- Household consent model
- AI/OCR boundaries, if used
