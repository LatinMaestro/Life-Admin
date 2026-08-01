# Store Privacy Declarations

This workbook maps Family Life Admin version 1.0.0 to Apple App Privacy and Google Play Data safety. It is a conservative draft, not a completed store form. The release owner must reconcile it against the frozen binary, provider configuration, store taxonomy, privacy policy, and reviewer paths before submission.

Official references:

- Apple App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- App Store Connect privacy reference: https://developer.apple.com/help/app-store-connect/reference/app-privacy/
- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469

Both stores require declarations to include applicable collection by integrated service providers and SDKs.

## Product Baseline

Version 1.0.0:

- requires an authenticated account and active household membership;
- stores account and household records through Clerk, the Family Life Admin API, Neon, and private object storage;
- supports optional, user-initiated camera capture and photo/document selection;
- supports private source uploads and retains only the source and metadata needed for household use;
- supports forwarded email intake and returns users to the original message or source;
- performs bounded OCR and classification to create reviewable drafts only;
- supports user-initiated voice capture and speech processing to create reviewable drafts only;
- supports opt-in push notifications and device registration;
- keeps manual creation available for every automated intake path;
- keeps raw OCR, classification, and speech material temporary under the documented retention controls;
- never stores, transcribes, reproduces, logs, or notifies structured payment identifiers;
- does not connect to banks or payment services;
- has no advertising, marketing, or cross-app tracking;
- provides in-app and public-web account deletion paths.

Camera, photo-library, microphone, and notification access must be requested only after a clear user action. Background audio recording and remote-notification background mode are disabled in the current native configuration.

## Data Inventory

| Product data | Stored or processed by | Linked | Purpose and retention position |
| --- | --- | --- | --- |
| Name, email, Clerk subject, user/member IDs | Clerk, PostgreSQL | Yes | Authentication, authorisation, invitations, recovery, security |
| Household name, timezone, membership and roles | PostgreSQL | Yes | Household functionality and access control |
| Tasks, reminders, inbox, shopping, notes, comments and activity | PostgreSQL | Yes | App functionality and household accountability |
| Bill/renewal title, provider, dates, notes and status | PostgreSQL | Yes | Administrative reminders only |
| Source label, sensitivity, optional HTTPS URL and upload metadata | PostgreSQL | Yes | Return to the original household source |
| Private uploaded documents and images | Private object storage and processing services | Yes | User-requested source storage, bounded extraction, and reviewable drafts |
| User-selected camera or photo content | Device, private object storage and processing services | Yes when uploaded | User-requested source capture and reviewable drafts |
| Forwarded email content and original-source metadata | Email intake, private storage and PostgreSQL | Yes | User-requested intake, reviewable drafts, and return to original source |
| Temporary OCR/classification text and draft metadata | Processing service and PostgreSQL where a bounded draft is retained | Yes | Reviewable intake draft; raw working material is temporary |
| User-initiated voice audio and temporary speech text | Device and speech-processing service | Yes when submitted | Reviewable voice draft; raw working material is temporary |
| Notification preferences, push token and installation/device registration ID | PostgreSQL and platform notification services | Yes | Opt-in notification delivery and deep links |
| Account/household deletion state | PostgreSQL, Clerk and storage providers | Yes until deletion completes | Account management and deletion operations |
| Request IP and IP-derived coarse location | Clerk, Vercel and applicable providers | Potentially | Security, abuse prevention and service operation |
| Client, request, error, performance and security records | Clerk, Vercel, Neon, Cloudflare and Expo as configured | Potentially | Reliability, troubleshooting and security |

The final provider audit must confirm exact storage duration, log redaction, deletion propagation, push-token handling, and whether any diagnostic data is linked.

## Apple App Privacy Draft

Unless the frozen-build audit shows otherwise, use App Functionality for product content, Account Management for account data, and Security or Fraud Prevention only where the store form permits and provider behaviour supports it. No listed data is used for tracking.

### Conservative Declare Set

| Apple data type | Current reason | Linked | Tracking |
| --- | --- | --- | --- |
| Contact Info - Name | User and household display names | Yes | No |
| Contact Info - Email Address | Sign-in, invitations, recovery and forwarded-email intake where used | Yes | No |
| Identifiers - User ID | Clerk and internal account/member identifiers | Yes | No |
| Identifiers - Device ID | Conservative treatment of push token or installation registration pending final provider audit | Potentially | No |
| User Content - Emails or Text Messages | Optional user-forwarded email content | Yes | No |
| User Content - Photos or Videos | Optional user-selected or camera-captured source images | Yes | No |
| User Content - Audio Data | Optional user-initiated voice capture for draft creation | Yes | No |
| User Content - Other User Content | Tasks, notes, lists, comments, uploaded files/documents, extracted drafts, source labels and settings | Yes | No |
| Usage Data - Product Interaction | Status changes and household activity history | Yes | No |
| Financial Info - Other Financial Info | Conservative classification for bill/renewal provider and date reminders | Yes | No |
| Location - Coarse Location | Providers may derive city/country from request IP | Potentially | No |
| Diagnostics - Other Diagnostic Data | Operational error, request and security records | Potentially | No |

Apple's taxonomy does not provide a separate general Files and Documents category in every form path. Confirm whether private documents belong under Other User Content, Photos or Videos, or both based on the final allowed file types and App Store Connect prompts.

### Do Not Declare Unless Final Audit Finds Collection

- Payment Info
- Credit Info
- Purchase History
- Contacts
- Precise Location
- Browsing History
- Search History
- Advertising Data
- Advertising identifier

Source URLs are user-provided references; they are not a browser-history feature.

### Verify Before Submission

- Inspect the final native dependency graph and entitlements.
- Verify push-provider treatment of device tokens and installation IDs.
- Verify upload, email, OCR/classification, voice, and diagnostic provider logs and retention.
- Confirm temporary raw OCR and speech processing still counts as collection under Apple's definition even when not retained.
- Preview every selected answer against the production privacy policy.
- Do not select Analytics unless production behaviour actually uses data for analytics.

## Google Play Data Safety Draft

Answer Yes to collection because user and service data is transmitted off device. The app does not sell data or share it for advertising. Confirm whether each service-provider transfer qualifies as collection rather than sharing under Google's current rules.

Data is encrypted in transit with HTTPS. Account deletion is available in Settings and through the public deletion page.

### Conservative Collected Set

| Google Play data type | Required or optional draft | Purposes | Sharing draft |
| --- | --- | --- | --- |
| Personal info - Name | Required for membership | App functionality, Account management | Service providers only |
| Personal info - Email address | Required for accounts; optional forwarded-email content | App functionality, Account management, Security | Service providers only |
| Personal info - User IDs | Required | App functionality, Account management, Security | Service providers only |
| Messages - Emails | Optional, user-forwarded intake | App functionality | Service providers only |
| Photos and videos - Photos | Optional, user selected or captured | App functionality | Service providers only |
| Audio files - Voice or sound recordings | Optional, user initiated | App functionality | Service providers only |
| Files and docs | Optional, user uploaded | App functionality | Service providers only |
| App activity - Other user-generated content | Optional per record | App functionality | Service providers only |
| App activity - App interactions | Generated when household actions occur | App functionality | Service providers only |
| Financial info - Other financial info | Optional reminder fields only | App functionality | Service providers only |
| Device or other IDs | Conservative push-token and installation registration treatment | App functionality | Service providers only |
| Location - Approximate location | May be derived from request IP | Security, Fraud prevention, App functionality | Service providers only |
| App info and performance - Diagnostics | Operational error, request and security records | Security, App functionality | Service providers only |

Do not select User payment info, Purchase history, Credit score, precise location, contacts, calendar events, installed apps, browsing history, or advertising/marketing data unless final evidence changes.

Household comments are private user-generated content. If Play Console classifies them as Other in-app messages, add that category with optional collection, App functionality, linked/account-scoped handling, and no advertising sharing.

## Permission And Processing Matrix

| Capability | Native access | Trigger | Server processing | Required evidence |
| --- | --- | --- | --- | --- |
| Camera capture | Camera | User chooses capture | Private upload and bounded extraction if submitted | Purpose string, denial/revocation, deletion |
| Photo/document selection | Photo library or system picker | User chooses a source | Private storage and bounded extraction | Allowed types, retention, deletion |
| Voice draft | Microphone | User starts recording | Temporary speech processing and reviewable draft | No background recording, raw-data cleanup |
| Notifications | Notification permission | User opts in | Push registration and delivery | Token lifecycle, opt-out, deep links |
| Forwarded email | No device permission | User forwards to intake address | Signed intake, private source, bounded draft | Signature rejection, retention, deletion |

All automation produces a reviewable draft. An authorised household member confirms it.

## Provider Audit

Before submission, record dated evidence for:

- Clerk account/session, IP, device, and security processing;
- Vercel request, function, diagnostic, and retention settings;
- Neon branch protection, backups, restore window, logs, and deletion behaviour;
- Cloudflare R2 privacy, Email Routing, Workers, Workers AI, logs, retention, and secret scopes;
- Expo/EAS build-artifact, push-token, build-log, and SDK behaviour;
- Apple Push Notification service behaviour for the signed build.

The earlier 19 July signed Android evidence predates the current upload, email, voice, and notification scope and must not be used as the final privacy basis.

## Sharing And Tracking Position

Draft answers:

- Data sold: No
- Third-party advertising: No
- Developer advertising or marketing: No
- Cross-app tracking: No
- Advertising identifier accessed: No
- Data shared publicly: No
- Household content exposed outside authorised membership: No
- Service-provider processing: only to deliver authentication, hosting, storage, intake, bounded processing, notification, security, and app functionality, subject to final configuration and contractual review

## Retention And Deletion

The in-app deletion flow removes the Clerk sign-in and anonymises the personal household profile. Shared household history may remain under a former-member label so other members do not lose shared records. Last-admin safeguards require another admin when necessary.

Before submission, verify:

- account and household deletion across Clerk, PostgreSQL and private object storage;
- cleanup of raw uploads, email payloads, OCR/classification material, voice audio, speech text and notification registrations;
- failure monitoring and retry behaviour;
- provider backup and log retention;
- privacy-policy disclosure of retained shared history;
- monitored support and deletion operations.

## Final Sign-Off

- [ ] Frozen iOS binary, entitlements, dependencies and permission strings match this inventory.
- [ ] Production Clerk, Vercel, Neon, Cloudflare, Expo and APNs settings match this inventory.
- [ ] Retention, cleanup, redaction and deletion journeys pass with fictional data.
- [ ] Device ID and diagnostics treatment is confirmed in the final provider audit.
- [ ] Apple answers are previewed against the privacy policy.
- [ ] Google answers are previewed against the privacy policy when Android submission is authorised.
- [ ] The release owner approves the final declarations and records dated evidence without secrets.
