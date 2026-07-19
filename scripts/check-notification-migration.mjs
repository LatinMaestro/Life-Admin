import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const schema = await readFile(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
const migration = await readFile(
  new URL("../prisma/migrations/20260719144500_private_push_notifications/migration.sql", import.meta.url),
  "utf8",
);

for (const model of ["DeviceInstallation", "NotificationPreference", "NotificationDelivery"]) {
  assert.match(schema, new RegExp(`model ${model} \\\{`), `${model} must be present in the Prisma schema.`);
  assert.match(migration, new RegExp(`CREATE TABLE "${model}"`), `${model} must be created by the migration.`);
}
assert.match(schema, /enabled\s+Boolean\s+@default\(false\)/, "Push notifications must default to off.");
assert.match(schema, /showPreview\s+Boolean\s+@default\(false\)/, "Lock-screen previews must default to off.");
assert.match(migration, /CREATE UNIQUE INDEX "NotificationDelivery_dedupeKey_key"/, "Deliveries must be deduplicated.");
assert.doesNotMatch(migration, /BPAY|BSB|accountNumber|customerReference|paymentReference/i, "Notification storage must not add payment identifiers.");

console.log("Private push notification migration guardrails passed.");
