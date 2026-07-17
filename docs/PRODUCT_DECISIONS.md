# Product Decisions

This document records approved product, architecture, and scope decisions for Family Life Admin. Future work should treat these decisions as settled unless the user explicitly reopens them.

## Approved Decisions

1. Family Life Admin is a separate project from SpendGrove.
2. Family Life Admin is household/family admin, not personal finance.
3. SpendGrove remains the finance app.
4. The first validated product is a mobile-first web app.
5. The app is household-first from the data model upward.
6. MVP roles are household admin and household member.
7. Manual creation is the default.
8. Email forwarding is a future phase.
9. AI extraction/classification is a future phase.
10. OCR is a future phase.
11. Voice capture is a future phase.
12. Notifications are deferred until separately approved.
13. File uploads are deferred until separately approved.
14. Source links/references may be included before full uploads.
15. Bills and renewals are admin reminders only.
16. The app must not store generated or transcribed payment identifiers.
17. Payment-related reminders point users back to original source documents, links, emails, images, or user-confirmed source crops/references.
18. The UI may optimise for one primary household while the schema remains multi-household ready.
19. The app uses calm, practical UI and avoids finance-dashboard language.
20. Every screen should present one obvious primary action, use plain language, hide optional detail until needed, and avoid unnecessary controls.
21. Household onboarding uses an in-app invitation matched to the signed-in user's verified primary email.
22. Outbound invitation email delivery remains deferred.
23. Production identity mapping uses the Clerk provider subject, never email alone.
24. Static/demo data must never silently replace live household data in production mode.
25. Native distribution is now approved for both the Apple App Store and Google Play.
26. The native client will use Expo/React Native and Expo Router so iOS and Android share a product codebase.
27. The native client will consume versioned authenticated APIs backed by the same household-scoped server services as the web app.
28. A thin WebView or repackaged website is not the approved store architecture.
29. Store delivery does not by itself approve push notifications, uploads, camera capture, OCR, AI, voice capture, or email forwarding.
30. Store submission requires privacy/support resources, account deletion, reviewer access, fictional screenshot data, and platform policy review.
31. Native authentication will use Clerk Expo with secure on-device token storage. Production-stable authentication flows are preferred over beta native components until separately reviewed.

## Practical Effect

The current delivery path is:

1. Finish protected web production verification.
2. Complete store privacy, deletion, and support prerequisites.
3. Build and test a versioned household API.
4. Build the Expo iOS/Android app with core workflow parity.
5. Run TestFlight and Google Play internal testing.
6. Submit only after all platform release gates pass.

Finance features and unapproved intake automation remain prohibited across every platform.
