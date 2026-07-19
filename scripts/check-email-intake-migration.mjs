import { readFile } from "node:fs/promises";

const sql = await readFile("prisma/migrations/20260719133000_household_email_intake/migration.sql", "utf8");
const required = [
  'CREATE TABLE "IntakeAlias"',
  'CREATE TABLE "IntakeEnvelope"',
  'CREATE UNIQUE INDEX "IntakeAlias_aliasTokenHash_key"',
  'CREATE UNIQUE INDEX "IntakeEnvelope_providerEventKeyHash_key"',
  'FOREIGN KEY ("householdId") REFERENCES "Household"',
];
const findings = required.filter((signal) => !sql.includes(signal));
for (const pattern of [/\bDROP\b/i, /\bTRUNCATE\b/i, /\bDELETE\s+FROM\b/i]) {
  if (pattern.test(sql)) findings.push(`Migration contains forbidden statement: ${pattern}`);
}
if (findings.length) {
  console.error("Email intake migration guardrail failed:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}
console.log("Email intake migration guardrail passed.");
