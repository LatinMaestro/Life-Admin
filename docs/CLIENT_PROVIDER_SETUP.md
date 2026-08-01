# Client Provider Setup

## Purpose

This is the account-owner reconciliation checklist before the single controlled Phase 16 deployment. Complete provider actions in the provider dashboards. Do not paste secret values into chat, GitHub, screenshots, build logs, or public notes.

Repository and runtime evidence may confirm that a resource exists without proving its secret values, least-privilege scope, retention, or successful end-to-end operation. Final fictional-data verification remains mandatory.

## Verified Provider State — 1 August 2026

- Clerk production authentication, the Grovekind domain, and Native API are configured.
- Neon production is PostgreSQL 17 with all eight reviewed migrations complete; main is unprotected and restore history is six hours.
- On 1 August the inactive production main branch was observed archived; a read-only schema query restored it to Ready with the read/write compute active, 8/8 migrations applied, and 28 public tables intact. Measure the candidate cold start and confirm that this branch lifecycle is acceptable before release.
- Cloudflare R2 bucket `family-life-admin-production` is provisioned privately with public access disabled.
- Production R2 CORS is restricted to `https://lifeadmin.grovekind.com` and `PUT`; incomplete multipart uploads expire after one day.
- `family-life-admin-email-intake` and `family-life-admin-operations` Workers contain the reviewed handlers and have public development URLs disabled.
- Production evidence shows the operations trigger is active and reaches cleanup and notification endpoints, but current main returns 404 before route-level bearer validation. PR #113 is the scoped fix.
- The final Email Routing subdomain/route, Worker secret alignment, R2 credential scope, Workers AI scope, provider retention, and deletion behaviour still require direct verification.
- Vercel production remains on Ready deployment `dpl_ADEQqtGDN5zqb99Jqenrk1XthcFL` at main `4233d14e4f77d096120a3d90c4b42d2928779f3d`.

Do not redeploy or change provider configuration merely to refresh evidence. Reconcile existing state first.

## 1. Cloudflare R2

Confirm in Cloudflare:

1. The bucket is `family-life-admin-production`.
2. Public access and public development URLs are disabled.
3. CORS permits only `https://lifeadmin.grovekind.com`, `PUT`, and the required request headers.
4. Incomplete multipart uploads expire after one day.
5. The production API token has Object Read & Write access for this bucket only.
6. Preview/test credentials, if any, are separate.
7. Retention, deletion, and access logs do not expose object contents or signed URLs.

If a replacement credential is required, create it in Cloudflare and store the Access Key ID and Secret Access Key directly in the password manager and Vercel. Never expose either value to Codex.

## 2. Workers AI

Confirm or create a token limited to Workers AI inference for the intended account:

- no DNS administration;
- no R2 administration;
- no unrelated Worker or account permissions;
- no source or extracted content in provider logs beyond the approved processing boundary;
- retention and deletion behaviour recorded for the final privacy audit.

Store the token directly in the password manager and Vercel.

## 3. Email Routing

Confirm in Cloudflare Email Routing for `grovekind.com`:

1. Existing `patrick`, `homevault`, `lifeadmin`, and `spendgrove` rules remain unchanged.
2. `intake.grovekind.com` exists and reports ready.
3. Its catch-all targets `family-life-admin-email-intake` only.
4. No apex-domain catch-all was enabled for this app.
5. Outbound sending remains disabled.
6. The Worker has the intended webhook URL as a non-secret variable.
7. The Worker secret matches Vercel's `EMAIL_WEBHOOK_SECRET` without revealing the value.
8. Signature timestamp, replay, duplicate, size, type, and attachment controls will be verified with fictional messages after deployment.

If the subdomain or route is not configured, leave it inactive until PR #113/#114 integration and provider preflight are complete.

## 4. Operations Worker

Confirm without revealing values:

1. `family-life-admin-operations` targets `https://lifeadmin.grovekind.com`.
2. Its schedule is the reviewed `*/5 * * * *` trigger.
3. Its encrypted `CRON_SECRET` matches Vercel.
4. It calls only:
   - `/api/internal/maintenance/cleanup`;
   - `/api/internal/notifications/dispatch`.
5. It sends no source content and logs no response bodies.
6. The trigger can be stopped independently for rollback.

Current 404 responses are expected from the old main boundary and do not prove that the shared secret matches. Verify successful route-level authentication only after the exact #113 fix is merged and included in the controlled deployment.

## 5. Private Secrets

Required independent secrets are at least 32 random characters:

- `EMAIL_ALIAS_SECRET` — Vercel only;
- `EMAIL_WEBHOOK_SECRET` — identical in Vercel and the Email Worker;
- `CRON_SECRET` — identical in Vercel and the operations Worker.

Never copy a secret into a repository issue, PR comment, screenshot, command output, or chat. Rotate any value suspected of exposure.

## 6. Vercel Production Environment

Confirm these names exist in Production only and remain server-only:

- `R2_ACCOUNT_ID=1cfce15cad76b6876673b16433ca7631`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME=family-life-admin-production`
- `CLOUDFLARE_ACCOUNT_ID=1cfce15cad76b6876673b16433ca7631`
- `CLOUDFLARE_AI_API_TOKEN`
- `EMAIL_ALIAS_SECRET`
- `EMAIL_WEBHOOK_SECRET`
- `EMAIL_INTAKE_DOMAIN=intake.grovekind.com`
- `CRON_SECRET`

None may use a `NEXT_PUBLIC_` or `EXPO_PUBLIC_` prefix. Do not trigger a Vercel deployment while checking environment names or values.

## 7. Completion Signal

Report **provider setup ready** only when the owner has confirmed the relevant existing configuration or completed the missing account actions without disclosing values.

That confirmation unlocks Codex to:

1. finish repository/provider preflight;
2. merge PR #113/#114 only after exact-head CI and review gates pass;
3. use one controlled production deployment;
4. verify signed email, bearer routes, invalid-request rejection, ordinary Clerk protection, storage, bounded processing, notifications, retention, cleanup, and deletion with fictional data;
5. create current Android preview and iOS simulator candidates from the same exact commit;
6. hand the candidate over for explicit client acceptance.

Paid Apple account work remains deferred until client acceptance and version 1.0.0 freeze.
