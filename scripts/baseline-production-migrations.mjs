import { spawnSync } from "node:child_process";
import { neon } from "@neondatabase/serverless";

const migrations = [
  "20260710103700_init",
  "20260717040000_account_deletion_requests",
  "20260719115500_advanced_recurrence",
  "20260719124500_secure_source_assets",
  "20260719133000_household_email_intake",
  "20260719140500_safe_intake_drafts",
  "20260719142500_voice_transcription",
  "20260719144500_private_push_notifications",
];
const requiredTables = [
  "User",
  "Household",
  "AccountDeletionRequest",
  "RecurrenceSeries",
  "RecurrenceOccurrence",
  "SourceAsset",
  "IntakeAlias",
  "IntakeEnvelope",
  "ExtractionJob",
  "IntakeDraft",
  "DeviceInstallation",
  "NotificationPreference",
  "NotificationDelivery",
];
const apply = process.argv.includes("--apply");
const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  fail("DATABASE_URL is required.");
}

let parsedUrl;
try {
  parsedUrl = new URL(databaseUrl);
} catch {
  fail("DATABASE_URL must be a valid URL.");
}

if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
  fail("DATABASE_URL must use PostgreSQL.");
}

const sql = neon(databaseUrl);
const tableState = await sql`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name = ANY(${requiredTables})
`;
const presentTables = new Set(tableState.map((row) => row.table_name));
const missingTables = requiredTables.filter((table) => !presentTables.has(table));
const [voiceState] = await sql`
  SELECT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'ExtractionStrategy'
      AND e.enumlabel = 'speech_transcription'
  ) AS has_voice_strategy
`;
const [historyState] = await sql`
  SELECT to_regclass('public."_prisma_migrations"') IS NOT NULL AS has_history
`;

if (missingTables.length || !voiceState?.has_voice_strategy) {
  const details = [
    missingTables.length ? `missing tables: ${missingTables.join(", ")}` : null,
    !voiceState?.has_voice_strategy ? "missing speech transcription strategy" : null,
  ].filter(Boolean);
  fail(`The reviewed production schema is incomplete (${details.join("; ")}); refusing to baseline migration history.`);
}

const appliedBefore = historyState?.has_history
  ? new Set(
      (
        await sql`
          SELECT migration_name
          FROM "_prisma_migrations"
          WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
        `
      ).map((row) => row.migration_name),
    )
  : new Set();

const missing = migrations.filter((name) => !appliedBefore.has(name));

if (missing.length === 0) {
  console.log("Production migration history is already baselined.");
  process.exit(0);
}

console.log(`Migration history needs baselining for: ${missing.join(", ")}`);

if (!apply) {
  console.log("Dry run only. Re-run with --apply after confirming the production target.");
  process.exit(0);
}

for (const migration of missing) {
  const pnpmCli = process.env.npm_execpath;
  const command = pnpmCli ? process.execPath : process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const args = pnpmCli
    ? [pnpmCli, "exec", "prisma", "migrate", "resolve", "--applied", migration, "--config", "prisma.config.ts"]
    : ["exec", "prisma", "migrate", "resolve", "--applied", migration, "--config", "prisma.config.ts"];
  const result = spawnSync(command, args, {
    env: process.env,
    stdio: "inherit",
  });

  if (result.error || result.status !== 0) {
    fail(`Prisma could not mark ${migration} as applied.`);
  }
}

const appliedAfter = new Set(
  (
    await sql`
      SELECT migration_name
      FROM "_prisma_migrations"
      WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
    `
  ).map((row) => row.migration_name),
);
const unresolved = migrations.filter((name) => !appliedAfter.has(name));

if (unresolved.length > 0) {
  fail(`Migration history verification failed for: ${unresolved.join(", ")}`);
}

console.log("Production migration history baseline completed and verified.");

function fail(message) {
  console.error(message);
  process.exit(1);
}
