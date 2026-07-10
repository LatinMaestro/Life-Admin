import { readFile } from "node:fs/promises";

const migrationPath = "prisma/migrations/20260710103700_init/migration.sql";
const sql = await readFile(migrationPath, "utf8");

const expectedTables = [
  "User",
  "Household",
  "HouseholdMember",
  "Invitation",
  "InboxItem",
  "Task",
  "Reminder",
  "RecurrenceRule",
  "ShoppingList",
  "ShoppingListItem",
  "BillOrRenewal",
  "BillReminder",
  "SourceReference",
  "Comment",
  "ActivityEvent",
  "HouseholdSettings",
];

const missingTables = expectedTables.filter(
  (table) => !sql.includes(`CREATE TABLE "${table}"`),
);
const requiredIdentityFragments = [
  '"authProvider" "AuthProvider"',
  '"authSubject" TEXT',
  '"User_authProvider_authSubject_key"',
];
const missingIdentityFragments = requiredIdentityFragments.filter(
  (fragment) => !sql.includes(fragment),
);
const destructivePatterns = [
  { label: "DROP DATABASE", pattern: /\bDROP\s+DATABASE\b/i },
  { label: "DROP TABLE", pattern: /\bDROP\s+TABLE\b/i },
  { label: "TRUNCATE", pattern: /\bTRUNCATE\b/i },
];
const destructiveFindings = destructivePatterns
  .filter(({ pattern }) => pattern.test(sql))
  .map(({ label }) => label);

if (
  missingTables.length > 0 ||
  missingIdentityFragments.length > 0 ||
  destructiveFindings.length > 0
) {
  console.error("Initial migration review gate failed.");

  if (missingTables.length > 0) {
    console.error(`Missing tables: ${missingTables.join(", ")}`);
  }

  if (missingIdentityFragments.length > 0) {
    console.error("Immutable Clerk identity mapping is incomplete.");
  }

  if (destructiveFindings.length > 0) {
    console.error(`Destructive statements found: ${destructiveFindings.join(", ")}`);
  }

  process.exit(1);
}

console.log(
  `Initial migration guardrail passed for ${expectedTables.length} household tables.`,
);
