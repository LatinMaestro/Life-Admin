# Future Phases

Future phases extend household administration without changing Family Life Admin into personal finance software.

## Approved Current Scale-Up

Native iOS and Android delivery is approved after completion of the web workflow foundation. The cross-platform implementation plan is in `docs/MOBILE_APP_STORE_ROADMAP.md`.

Store delivery includes native authentication, core household workflow parity, secure API access, device testing, and store compliance. It does not automatically approve device permissions or new intake channels.

## Still Deferred

- Email forwarding
- AI intake and classification
- OCR extraction
- Voice capture
- Push notifications
- SMS reminders
- Production file uploads
- Camera/document capture
- Advanced recurrence
- Advanced permissions
- Multi-household switching UI

## Email Forwarding

A future forwarding phase may create source references and draft inbox items for review. It must not automatically transcribe payment identifiers.

## AI And OCR

AI or OCR may later suggest categories, dates, providers, or titles. Suggestions require review and must never extract or persist payment identifiers.

## Voice Capture

Voice capture may later create reviewable household drafts. It must not create automated financial records.

## Notifications

Before implementation, approve channels, preferences, quiet hours, household visibility, privacy behavior, and platform permission timing. Store delivery alone is not notification approval.

## Uploads And Camera

Before implementation, approve storage, retention, access control, malware handling, deletion, source review, and platform permission copy. Source links and references remain the current approach.

## Multi-Household UI

The schema supports multiple household memberships. The UI may continue to optimise for one primary household until switching behavior is explicitly designed.
