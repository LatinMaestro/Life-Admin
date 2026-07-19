import { readFile } from "node:fs/promises";

const path = "prisma/migrations/20260719115500_advanced_recurrence/migration.sql";
const sql = await readFile(path, "utf8");
const required = [
  'CREATE TABLE "RecurrenceSeries"',
  'CREATE TABLE "RecurrenceOccurrence"',
  '"RecurrenceOccurrence_seriesId_scheduledFor_key"',
  '"RecurrenceSeries_householdId_fkey"',
  '"RecurrenceOccurrence_householdId_fkey"',
  '"RecurrenceOccurrence_seriesId_fkey"',
];
const forbidden = [/\bDROP\s+TABLE\b/i, /\bTRUNCATE\b/i, /\bDELETE\s+FROM\b/i];
const missing = required.filter((fragment) => !sql.includes(fragment));
const destructive = forbidden.filter((pattern) => pattern.test(sql));
if (missing.length || destructive.length) {
  console.error("Recurrence migration guardrail failed.");
  if (missing.length) console.error(`Missing: ${missing.join(", ")}`);
  if (destructive.length) console.error("A destructive statement was found.");
  process.exit(1);
}
console.log("Recurrence migration is additive and contains required household constraints.");
