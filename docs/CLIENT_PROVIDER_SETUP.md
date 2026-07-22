# Client Provider Setup

## Purpose

These are the only account-owner steps required before the controlled Phase 16 deployment. Complete them in provider dashboards. Do not paste secrets into chat, GitHub, screenshots, or public notes.

Both reviewed Cloudflare Workers are already staged without routes, schedules, public development URLs, or encrypted secrets.

## 1. Cloudflare R2 Credential

1. Open Cloudflare, then **R2 Object Storage**.
2. Open **Manage R2 API tokens**.
3. Create an account API token with **Object Read & Write** access.
4. Restrict it to the `family-life-admin-production` bucket only.
5. Save the generated **Access Key ID** and **Secret Access Key** directly into a password manager.
6. Do not enable public access.

## 2. Workers AI Credential

1. Open Cloudflare, then **AI > Workers AI**.
2. Create a scoped API token for Workers AI inference only.
3. Avoid account administration, DNS, R2, and unrelated permissions.
4. Save the token directly into a password manager.

## 3. Email Routing Subdomain

1. Open Cloudflare **Email Routing** for `grovekind.com`.
2. Open **Settings**, then **Subdomains**.
3. Add `intake`.
4. Wait until `intake.grovekind.com` reports ready.
5. Do not change the existing `patrick`, `homevault`, `lifeadmin`, or `spendgrove` forwarding rules.
6. Do not enable an apex-domain catch-all.

## 4. Private Secrets

Generate three independent random secrets of at least 32 characters and store them in a password manager:

- `EMAIL_ALIAS_SECRET`
- `EMAIL_WEBHOOK_SECRET`
- `CRON_SECRET`

The `EMAIL_WEBHOOK_SECRET` value must be identical in Vercel and the Email Worker. The `CRON_SECRET` value must be identical in Vercel and the operations Worker. `EMAIL_ALIAS_SECRET` remains in Vercel only.

## 5. Vercel Production Values

Open the `life-admin` project, then **Settings > Environment Variables**. Add these values to **Production** only:

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

Keep every value server-only. None may use a `NEXT_PUBLIC_` or `EXPO_PUBLIC_` prefix.

## 6. Completion Signal

After all five sections are complete, tell Codex **provider setup ready**. Codex will then:

1. add the encrypted secrets to the staged Workers;
2. connect the `intake.grovekind.com` catch-all;
3. activate the private maintenance scheduler;
4. enable one controlled Vercel deployment;
5. verify production with fictional data;
6. create final Android preview and iOS simulator candidates;
7. hand the app over for client acceptance testing.

Paid Apple Developer and Google Play setup remains deferred until after client approval.
