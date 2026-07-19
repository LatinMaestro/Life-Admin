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


32. Phases 1-16 in `docs/PHASES_1_TO_16.md` are approved for autonomous implementation before client testing.
33. Paid Apple Developer and Google Play setup is deferred until the client approves the Phase 16 candidate.
34. Automatic Vercel Git deployments are paused during Phases 1-15 and re-enabled for the controlled client-test deployment.
35. Self-service account and first-household onboarding are required before public release.
36. Advanced recurrence is approved for household tasks, reminders, bills, and renewals.
37. Private file uploads and user-initiated camera/document capture are approved behind household-scoped storage, retention, deletion, and validation controls.
38. Household email forwarding is approved as a review-first intake channel with verified webhooks, abuse controls, and private source retention.
39. Direct text extraction and OCR are approved for email bodies, text PDFs, scanned PDFs, and supported images.
40. Extracted content may produce bounded suggestions for inbox items, tasks, reminders, bills, renewals, and source references.
41. Every extracted suggestion remains a draft until an authorised household member confirms it.
42. Raw OCR text is temporary and must not be retained after safe-field projection.
43. Structured payment identifiers must be discarded before persistence, logs, classification, notifications, search, or activity history.
44. User-initiated voice capture and narrow speech-to-text are approved only for reviewable drafts; background recording is prohibited.
45. Opt-in push notifications are approved with per-member preferences, quiet hours, generic previews by default, and authenticated deep links.
46. General-purpose generative AI, autonomous action creation, payment execution, and finance analytics remain unapproved.
47. Manual creation remains available for every workflow even when an automated intake channel exists.
48. Final web/native UI review and client acceptance testing are mandatory before the paid release phase.

## Practical Effect

The current delivery path is:

1. Finish protected web production verification.
2. Complete store privacy, deletion, and support prerequisites.
3. Build and test a versioned household API.
4. Build the Expo iOS/Android app with core workflow parity.
5. Run TestFlight and Google Play internal testing.
6. Submit only after all platform release gates pass.

Finance features remain prohibited across every platform. Approved intake automation is bounded by household authorization, temporary processing, safe-field allowlists, payment-data rejection, and mandatory user confirmation.
