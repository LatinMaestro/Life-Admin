import { readFile } from "node:fs/promises";

const migrationPath = "prisma/migrations/20260719124500_secure_source_assets/migration.sql";
const sql = await readFile(migrationPath, "utf8");
const required = [
  'CREATE TABLE "SourceAsset"',
  '"householdId" TEXT NOT NULL',
  '"objectKey" TEXT NOT NULL',
  'CREATE UNIQUE INDEX "SourceAsset_objectKey_key"',
  'FOREIGN KEY ("householdId") REFERENCES "Household"',
  'FOREIGN KEY ("sourceReferenceId") REFERENCES "SourceReference"',
  'FOREIGN KEY ("createdByMemberId") REFERENCES "HouseholdMember"',
];
const forbidden = [/\bDROP\b/i, /\bTRUNCATE\b/i, /\bDELETE\s+FROM\b/i];
const findings = required.filter((signal) => !sql.includes(signal));
for (const pattern of forbidden) {
  if (pattern.test(sql)) findings.push(`Migration contains forbidden statement: ${pattern}`);
}
if (findings.length) {
  console.error("Source asset migration guardrail failed:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}
console.log("Source asset migration guardrail passed.");
