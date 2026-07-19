# Voice Capture Runbook

## Product Boundary

Voice capture is an optional way to prepare one household admin draft. It is not a background recorder, assistant, or general-purpose AI feature. Manual creation remains available.

## Flow

1. The member taps Record voice note.
2. The operating system microphone prompt appears only after that tap.
3. Recording is visible and stops after three minutes or when the member taps Stop.
4. The private temporary audio file is uploaded with a 24-hour maximum retention.
5. Cloudflare Workers AI speech recognition returns a transient transcript.
6. The transcript passes through the payment-data protection and safe draft allowlist.
7. The transcript is discarded. The server and device audio copies are deleted after successful draft creation.
8. The member reviews and confirms or dismisses the suggestion.

## Configuration

Voice processing reuses the server-only CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_AI_API_TOKEN values documented in the safe intake runbook. The token must include only the Workers AI capability required by document conversion and speech recognition.

## Privacy And Failure

- Recording cannot continue in the background.
- No transcript is stored, logged, searched, notified, or written to activity.
- A failed transcription leaves the temporary server audio available only for bounded retry and cleanup.
- A cleanup failure retains the 24-hour expiry and never exposes a public URL.
- Lock-screen or other notification text never includes voice content.
- The same prohibited-identifier protection runs before every draft field is stored.
