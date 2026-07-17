# Store Privacy Declarations

This document maps Family Life Admin version 1.0.0 to Apple App Privacy and Google Play Data safety fields. It is a release workbook, not a substitute for reviewing the final production build, provider settings, and store questionnaires.

The release owner remains responsible for the declarations submitted to Apple and Google. Reconcile this document after production Clerk, Vercel, Neon, and Expo settings are final.

## Official Definitions

- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Apple App Store Connect privacy reference: https://developer.apple.com/help/app-store-connect/reference/app-privacy/
- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469

Apple requires the declaration to include data collected by the app and integrated third-party partners. Google likewise requires third-party SDK collection to be reflected in the Data safety form.

## Product Baseline

Version 1.0.0:

- requires an authenticated account and active household membership;
- sends account and household data to Clerk, the Family Life Admin API, and Neon-backed storage;
- contains no advertising or marketing SDK;
- performs no cross-app or cross-site tracking;
- requests no camera, microphone, photo, contacts, calendar, location, or notification permission;
- accepts manual text, dates, assignments, and HTTPS source references;
- does not upload files, photos, video, or audio;
- does not connect to banks or payment services;
- does not collect payment credentials, payment references, purchase transactions, or bank account information;
- stores bill and renewal names, providers, and dates only as household admin reminders;
- provides in-app and public-web account deletion paths.

## Data Inventory

| Product data | Stored or processed by | Linked to account/household | Primary purpose |
| --- | --- | --- | --- |
| Name and household display name | Clerk, PostgreSQL | Yes | Account and household functionality |
| Email address | Clerk, PostgreSQL | Yes | Authentication, invitations, account management |
| Clerk subject and internal user/member IDs | Clerk, PostgreSQL | Yes | Authentication, authorization, security |
| Household name and timezone | PostgreSQL | Yes | Household functionality |
| Tasks, reminders, inbox items, shopping content, notes, and comments | PostgreSQL | Yes | App functionality |
| Assignments, status changes, and activity history | PostgreSQL | Yes | App functionality, household accountability |
| Bill/renewal title, provider, due/renewal date, notes, and status | PostgreSQL | Yes | Household admin reminders |
| Source title, location label, sensitivity, and optional HTTPS URL | PostgreSQL | Yes | Return to the original household source |
| Password and verification factors | Clerk | Yes | Authentication and security; the app does not store passwords |
| Account deletion request status | PostgreSQL, Clerk | Yes until deletion completes | Account management and deletion operations |
| Operational request/security logs | Vercel, Clerk, Neon as configured | Potentially | Security, reliability, abuse prevention |

## Apple App Privacy Draft

All listed data is used for **App Functionality** unless the final provider audit identifies an additional purpose. It is linked to the user's identity or household account. It is not used for tracking.

### Declare

| Apple data type | Why | Linked | Tracking |
| --- | --- | --- | --- |
| Contact Info - Name | User and household member display names | Yes | No |
| Contact Info - Email Address | Sign-in, invitations, account recovery | Yes | No |
| Identifiers - User ID | Clerk subject and internal account/member identifiers | Yes | No |
| User Content - Other User Content | User-entered tasks, notes, lists, comments, source labels, and household settings | Yes | No |
| Usage Data - Product Interaction | Status changes and activity history are transmitted and retained to provide household activity features | Yes | No |
| Financial Info - Other Financial Info | Conservative classification for user-entered bill/renewal provider and date reminders | Yes | No |

### Do Not Declare For Current Features

- Payment Info
- Credit Info
- Purchase History
- Emails or Text Messages
- Photos or Videos
- Audio Data
- Contacts
- Precise or Coarse Location
- Browsing History
- Search History
- Advertising Data
- Device ID, unless the final Clerk/Expo provider audit says otherwise

Source URLs are user-provided references. The app does not record which external pages the user browses.

### Verify Before Submission

Confirm whether production Clerk, Vercel, Neon, Expo, or App Store build diagnostics require:

- Crash Data;
- Performance Data;
- Other Diagnostic Data;
- Device ID.

Do not select Analytics unless production configuration actually uses data to measure user behaviour or product performance. Operational security and reliability processing may remain App Functionality under Apple's definitions.

## Google Play Data Safety Draft

The app transmits user data off device, so answer **Yes** to data collection. The app does not sell data or share it for advertising. Confirm the final service-provider relationships before answering Google's sharing questions.

Data is encrypted in transit through HTTPS. The app provides account deletion from Settings and a public account-deletion page.

### Declare As Collected

| Google Play data type | Required or optional draft | Purposes | Shared draft |
| --- | --- | --- | --- |
| Personal info - Name | Required for household membership | App functionality, Account management | No; service providers only |
| Personal info - Email address | Required | App functionality, Account management, Security | No; service providers only |
| Personal info - User IDs | Required | App functionality, Account management, Security | No; service providers only |
| App activity - Other user-generated content | Optional per item; central to app use | App functionality | No; service providers only |
| App activity - App interactions | Required for household activity history when actions are taken | App functionality | No; service providers only |
| Financial info - Other financial info | Optional | App functionality | No; service providers only |

The conservative financial classification covers bill/renewal provider and date reminders only. Do not select User payment info, Purchase history, or Credit score.

### Do Not Declare For Current Features

- Approximate or precise location
- Phone number
- Address
- Contacts
- Emails, SMS/MMS, or device message access
- Photos, videos, audio, files, or documents
- Calendar events
- In-app search history
- Installed apps
- Web browsing history
- Advertising or marketing data
- Device or other IDs, unless the final provider audit says otherwise

Comments are household user-generated content, not public messaging. If Play Console guidance classifies household comments as **Other in-app messages** for the final build, add that data type with App functionality, optional collection, linked/account-scoped handling, and no advertising sharing.

### Verify Before Submission

Review current disclosures from Clerk, Vercel, Neon, Expo, and any store build services for:

- Device or other IDs;
- Approximate location inferred or retained from IP addresses;
- Crash logs;
- Diagnostics;
- Other app performance data.

Google states that approximate location inferred from IP address can require disclosure. Confirm whether any provider retains or uses IP-derived location rather than assuming it is absent.

## Sharing And Tracking Position

Draft answers:

- Data sold: **No**
- Data used for third-party advertising: **No**
- Data used for developer advertising or marketing: **No**
- Cross-app tracking: **No**
- Advertising identifier accessed: **No**
- Data shared publicly: **No**
- Household content shared outside authorised household membership: **No**
- Service providers process data only to deliver authentication, hosting, database, security, and app functionality, subject to final contract and configuration review.

## Retention And Deletion

The in-app deletion flow removes the Clerk sign-in and anonymizes the user's personal household profile. Shared household history may remain under a former-member label so other members do not lose shared records. Last-admin safeguards require another admin before deletion when necessary.

Before store submission, confirm:

- deletion completes in Clerk and PostgreSQL;
- failed deletion requests are operationally monitored;
- backups and provider retention periods are documented;
- the public privacy policy accurately explains retained shared history;
- the support operator can respond to deletion questions;
- Play Console's deletion URL points to the production account-deletion page.

## Final Sign-Off

Do not submit either store form until all boxes are checked:

- [ ] Production provider settings match this inventory.
- [ ] No analytics, crash reporting, social login, uploads, notifications, or other SDKs were added after this review.
- [ ] Clerk's current privacy and Data safety guidance was reviewed.
- [ ] Vercel's current privacy and logging configuration was reviewed.
- [ ] Neon retention, backup, and operational access were reviewed.
- [ ] Expo/EAS build and update telemetry was reviewed.
- [ ] The conservative bill-reminder classification was confirmed in both store consoles.
- [ ] Apple responses were previewed and checked against the privacy policy.
- [ ] Google responses were previewed and checked against the privacy policy.
- [ ] A release owner recorded the completion date and evidence links in GitHub issue #70.
