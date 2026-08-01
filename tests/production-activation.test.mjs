import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../scripts/check-production-activation.mjs", import.meta.url));
const managedNames = [
  "FAMILY_LIFE_ADMIN_AUTH_MODE",
  "FAMILY_LIFE_ADMIN_PERSISTENCE_MODE",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "DATABASE_URL",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_AI_API_TOKEN",
  "EMAIL_ALIAS_SECRET",
  "EMAIL_WEBHOOK_SECRET",
  "EMAIL_INTAKE_DOMAIN",
  "CRON_SECRET",
];
const cleanEnvironment = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !managedNames.includes(name)),
);
const liveEnvironment = {
  FAMILY_LIFE_ADMIN_AUTH_MODE: "clerk",
  FAMILY_LIFE_ADMIN_PERSISTENCE_MODE: "prisma",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
  CLERK_SECRET_KEY: "sk_test_example",
  DATABASE_URL: "postgresql://family_admin:safe_test_value@db.example.test:5432/life_admin",
  R2_ACCOUNT_ID: "account-123",
  R2_ACCESS_KEY_ID: "access-key",
  R2_SECRET_ACCESS_KEY: "secret-key",
  R2_BUCKET_NAME: "family-life-admin-production",
  CLOUDFLARE_ACCOUNT_ID: "account-123",
  CLOUDFLARE_AI_API_TOKEN: "workers-ai-token",
  EMAIL_ALIAS_SECRET: "a".repeat(32),
  EMAIL_WEBHOOK_SECRET: "b".repeat(32),
  EMAIL_INTAKE_DOMAIN: "intake.grovekind.com",
  CRON_SECRET: "c".repeat(32),
};

test("static demo configuration remains valid for CI builds", () => {
  const result = run({});
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Static demo configuration is complete/);
});

test("live activation fails closed when provider configuration is missing", () => {
  const result = run({
    FAMILY_LIFE_ADMIN_AUTH_MODE: "clerk",
    FAMILY_LIFE_ADMIN_PERSISTENCE_MODE: "prisma",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_example",
    CLERK_SECRET_KEY: "sk_test_example",
    DATABASE_URL: liveEnvironment.DATABASE_URL,
  });
  assert.equal(result.status, 1);
  for (const name of [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_AI_API_TOKEN",
    "EMAIL_ALIAS_SECRET",
    "EMAIL_WEBHOOK_SECRET",
    "EMAIL_INTAKE_DOMAIN",
    "CRON_SECRET",
  ]) {
    assert.match(result.stderr, new RegExp(name));
  }
});

test("complete live provider configuration passes", () => {
  const result = run(liveEnvironment, ["--require-live"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Production activation configuration is complete/);
});

test("live activation rejects wrong resources, weak shared secrets, and account mismatch", () => {
  const result = run({
    ...liveEnvironment,
    R2_BUCKET_NAME: "another-bucket",
    CLOUDFLARE_ACCOUNT_ID: "another-account",
    EMAIL_INTAKE_DOMAIN: "mail.example.test",
    EMAIL_ALIAS_SECRET: "short",
    EMAIL_WEBHOOK_SECRET: "short",
    CRON_SECRET: "short",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /R2_BUCKET_NAME must be family-life-admin-production/);
  assert.match(result.stderr, /EMAIL_INTAKE_DOMAIN must be intake\.grovekind\.com/);
  assert.match(result.stderr, /R2_ACCOUNT_ID and CLOUDFLARE_ACCOUNT_ID/);
  assert.match(result.stderr, /EMAIL_ALIAS_SECRET must contain at least 32 characters/);
  assert.match(result.stderr, /EMAIL_WEBHOOK_SECRET must contain at least 32 characters/);
  assert.match(result.stderr, /CRON_SECRET must contain at least 32 characters/);
});

test("explicit live verification rejects demo mode", () => {
  const result = run({}, ["--require-live"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requires clerk authentication and Prisma persistence/);
});

function run(environment, args = []) {
  return spawnSync(process.execPath, [script, ...args], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    env: { ...cleanEnvironment, ...environment },
    encoding: "utf8",
  });
}
