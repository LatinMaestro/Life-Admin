# Private Push Notifications Runbook

## Purpose

Push notifications are optional household reminders. They are not enabled automatically and the app never asks for notification permission during sign-in or startup.

## Privacy Defaults

- A member must tap the notification switch before the operating system permission prompt appears.
- Lock-screen text is generic by default.
- Item names appear only after the member explicitly enables previews.
- Bill and renewal notifications never contain payment identifiers or payment instructions.
- Tapping a bill reminder opens Family Life Admin so the member can follow the original source reference.
- Expo push tokens and one-way installation key hashes are private operational data.
- Each installation is scoped to the authenticated user, active household, and household member.
- Signing out attempts to revoke the current installation.
- Quiet hours default to 21:00-07:00 in the household timezone.

## Delivery

The internal `POST /api/internal/notifications/dispatch` endpoint:

1. requires a `Bearer` token equal to a strong `CRON_SECRET`;
2. gathers due, assigned household items;
3. applies each member's category and quiet-hour preferences;
4. creates unique delivery rows to prevent duplicates;
5. sends generic Expo Push API messages;
6. retries temporary provider failures up to three times;
7. marks invalid device tokens so they are not reused.

Do not place `CRON_SECRET`, push tokens, household item text, or provider responses in logs.

## Activation Checklist

Activation is intentionally deferred until client testing.

- Apply the private push notification migration.
- Add a randomly generated `CRON_SECRET` of at least 32 characters to the production runtime.
- Configure a scheduler to call the internal dispatch endpoint every five minutes.
- Build an Expo development or store binary; remote push notifications are not supported in Expo Go on Android.
- Configure Apple and Google push credentials in EAS only when the paid store-release phase begins.
- Send one test notification to each platform and confirm generic lock-screen text, deep linking, quiet hours, opt-out, and token revocation.

Vercel deployment and store credentials are not required for this implementation review pass.
