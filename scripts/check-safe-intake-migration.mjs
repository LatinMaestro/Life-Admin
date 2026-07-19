import { readFile } from "node:fs/promises";

const migrationPath = "prisma/migrations/20260719140500_safe_intake_drafts/migration.sql";
const schemaPath = "prisma/schema.prisma";
const [migration, schema] = await Promise.all([
  readFile(migrationPath, "utf8"),
  readFile(schemaPath, "utf8"),
]);

const requiredMigrationTokens = [
  'CREATE TABLE "ExtractionJob"',
  'CREATE TABLE "IntakeDraft"',
  '"householdId" TEXT NOT NULL',
  '"intakeEnvelopeId" TEXT NOT NULL',
  '"sourceReferenceId" TEXT NOT NULL',
  '"redactionSummary" JSONB',
  '"IntakeDraft_intakeEnvelopeId_key"',
  '"IntakeDraft_householdId_state_idx"',
  '"ExtractionJob_state_expiresAt_idx"',
  'REFERENCES "Household"("id")',
  'REFERENCES "IntakeEnvelope"("id")',
  'REFERENCES "SourceReference"("id")',
];

const requiredSchemaTokens = [
  "model ExtractionJob",
  "model IntakeDraft",
  "enum ExtractionJobState",
  "enum IntakeDraftType",
  "redactionSummary",
  "@@index([householdId, state])",
  "@@index([state, expiresAt])",
];

const missing = [
  ...requiredMigrationTokens.filter((token) => !migration.includes(token)).map((token) => `migration: ${token}`),
  ...requiredSchemaTokens.filter((token) => !schema.includes(token)).map((token) => `schema: ${token}`),
];

if (missing.length) {
  console.error("Safe intake migration guard failed:");
  for (const token of missing) console.error(`- ${token}`);
  process.exit(1);
}

console.log("Safe intake migration guard passed.");
