# Recurrence And Notification Design

## Principles

Recurrence describes when a household obligation repeats. Notifications are optional delivery attempts for confirmed records. Neither feature creates financial analytics or payment instructions.

## Recurrence Model

Use a series-and-occurrence model.

### RecurrenceSeries

- householdId
- targetType and targetId
- timezone
- frequency: daily, weekly, monthly, yearly, custom
- interval
- selected weekdays where applicable
- day-of-month or end-of-month policy
- local time
- startsOn
- endsOn or occurrenceLimit
- state: active, paused, ended
- nextGenerationAt
- createdByMemberId
- createdAt and updatedAt

### RecurrenceOccurrence

- householdId
- seriesId
- scheduledFor
- localDate
- state: scheduled, completed, skipped, cancelled
- source item pointer
- override metadata
- generatedAt
- completedAt

A unique seriesId plus scheduled local date/time prevents duplicates.

## Generation Rules

- Generate a bounded horizon rather than an unlimited future series.
- Run generation idempotently and lock or compare-and-set the series cursor.
- Resolve dates in the household timezone.
- Define month-end behavior explicitly: use the last valid day when the selected day is unavailable.
- Preserve local wall-clock intent through daylight-saving changes.
- Do not silently recreate skipped or cancelled occurrences.
- Editing one occurrence creates an override; editing the series affects future unmodified occurrences only.

## Supported User Actions

- complete or reopen an occurrence;
- skip one occurrence;
- edit one occurrence;
- edit this and future occurrences;
- pause or resume a series;
- end a series;
- inspect the next occurrence.

Keep advanced custom rules behind progressive disclosure.

## Notification Preferences

Preferences belong to a household member and installation:

- enabled;
- allowed item types;
- default reminder offsets;
- quiet-hour start and end;
- timezone;
- lock-screen preview mode: generic or title;
- assignment and invitation preferences;
- device token state.

Generic preview is the default for bills, renewals, sources, email intake, OCR drafts, and voice drafts.

## Notification Scheduling

- Schedule only from confirmed records or recurrence occurrences.
- A draft may generate only a generic “item ready to review” notification.
- Derive payloads server-side and include only opaque deep-link identifiers.
- Recheck membership and item state immediately before delivery.
- Suppress delivery for completed, archived, deleted, unassigned, or revoked records.
- Use a deterministic event key to prevent duplicates.
- Respect quiet hours by moving non-urgent deliveries to the next allowed time.
- Revoke device tokens on sign-out, account deletion, provider rejection, or prolonged invalidity.

## Deep Links

Opening a notification:

1. restores or requests authentication;
2. resolves active household membership;
3. fetches the target through a household-scoped API;
4. shows a safe unavailable state if access or the target no longer exists.

No private content is encoded in the URL.

## Permission Timing

Do not request push permission at first launch. Ask after a user creates or confirms a reminder, with a plain explanation and a “Not now” option. Camera and microphone follow the same just-in-time rule.

## Delivery And Scheduling Adapter

Keep provider details behind interfaces for:

- register/revoke token;
- schedule/cancel event;
- send batch;
- inspect delivery result;
- reconcile invalid tokens.

Expo push delivery is the expected cross-platform starting point. iOS APNs credentials are completed only in the paid store phase; development and Android testing continue beforehand.

## Review Gates

- timezone and DST fixtures;
- duplicate scheduler execution;
- completion immediately before delivery;
- role removal and account deletion;
- quiet-hour boundaries;
- generic lock-screen copy;
- stale/rotated device token;
- deep link after session expiry;
- bill reminder containing no payment identifier or source excerpt.
