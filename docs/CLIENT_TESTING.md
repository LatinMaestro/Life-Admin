# Client Acceptance Testing

## Purpose

This checklist is the Phase 16 acceptance journey for Family Life Admin. Use only fictional household information and harmless sample documents. Do not enter real payment instructions, account details, identity documents, medical records, or private family material.

Record feedback by screen name and the action being attempted. A screenshot is helpful only when it contains fictional information.

## Fictional Household

Use this small scenario so every screen remains easy to understand:

- Household: Rivera Household
- Admin: Alex Rivera
- Member: Sam Rivera
- Inbox item: Organise winter uniform
- Task: Replace hallway light
- Weekly reminder: Put bins out
- Shopping list: Weekend groceries
- Shopping items: Milk, apples, dishwashing tablets
- Bill reminder: Water service notice, due next Friday
- Renewal: Home internet plan, renews next month
- Safe source link: a fictional HTTPS link with no credentials or payment data
- Comment: Sam will collect this on Thursday

For file, camera, email, OCR, and voice tests, use a newly created fictional note containing only a title, provider name, ordinary household note, and future date. No payment identifiers should appear in the file or message.

## Web Journey

1. Sign up with the intended test account.
2. Create or open the Rivera Household.
3. Confirm Home shows only useful current counts and upcoming work.
4. Add the inbox item, then sort it into a task or reminder.
5. Add, edit, complete, reopen, and archive a task.
6. Create the weekly reminder and confirm the next occurrence is understandable.
7. Create the shopping list, add the three items, check one off, edit one, and restore an archived list.
8. Create the bill reminder and renewal. Confirm each points to an original source and shows no payment instructions or finance analysis.
9. Add a safe source link and open it.
10. Upload the fictional source, review it, and remove it.
11. Review an OCR suggestion, edit it, and explicitly confirm or dismiss it.
12. Add a comment and confirm the activity entry is neutral and useful.
13. Review Family roles and household settings.
14. Sign out and confirm household pages require sign-in.

## Native Journey

1. Install the Android preview or open the iOS simulator candidate.
2. Sign in and confirm the same household data appears.
3. Complete the inbox, task, reminder, shopping, bill/renewal, source, comment, and activity journeys.
4. Capture the fictional source with the camera. Review, retake, confirm, and cancel once each.
5. Record a short fictional voice note. Confirm recording is visible, review is required, and temporary wording is clear.
6. Deny camera or microphone permission once and confirm the app remains usable.
7. Enable and disable notification preferences. Confirm sensitive previews are off by default.
8. Turn airplane mode on for one read and one write, then confirm the retry message is understandable and no duplicate is created after reconnecting.
9. Increase system text size and confirm the main actions and navigation remain readable.
10. Sign out and confirm the installation is no longer registered for private notifications.

## Email Journey

1. Copy the household's private forwarding address from Settings.
2. Forward one fictional plain-text message.
3. Forward one fictional message with a supported image or PDF attachment.
4. Confirm each creates one review draft rather than an active task, reminder, bill, or renewal.
5. Forward the same message again and confirm it does not create a duplicate.
6. Rotate the forwarding address and confirm the previous address is no longer accepted.

## Privacy Checks

- Automated suggestions always require confirmation.
- Original sources stay private and require current household access.
- Raw email, OCR, and voice text never appears in activity history or notifications.
- Bill and renewal screens contain no finance dashboard, transaction, budget, cashflow, or payment-entry workflow.
- Deleting a source removes access without exposing provider details.
- A household member cannot use administrator-only household controls.
- A second household cannot read or change the Rivera Household.

## Acceptance

Phase 16 passes when:

- the web and native critical journeys work with fictional data;
- no confusing, duplicate, or unnecessary primary controls remain;
- no privacy, authorization, source-retention, or payment-source issue remains;
- release-blocking feedback is resolved and the affected automated gates pass;
- the client explicitly approves the UI and complete workflow.

Paid Apple Developer and Google Play work starts only after this approval.
