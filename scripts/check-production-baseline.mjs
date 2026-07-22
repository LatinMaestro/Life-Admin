import { readdir, readFile } from "node:fs/promises";

const migrationDirectory = new URL("../prisma/migrations/", import.meta.url);
const baselinePath = new URL("./baseline-production-migrations.mjs", import.meta.url);
const entries = await readdir(migrationDirectory, { withFileTypes: true });
const migrationNames = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const baseline = await readFile(baselinePath, "utf8");
const missing = migrationNames.filter((name) => !baseline.includes(`"${name}"`));

if (missing.length) {
  console.error("Production baseline guard is missing reviewed migrations:");
  for (const name of missing) console.error(`- ${name}`);
  process.exit(1);
}

for (const token of [
  "requiredTables",
  "RecurrenceSeries",
  "SourceAsset",
  "IntakeEnvelope",
  "IntakeDraft",
  "DeviceInstallation",
  "speech_transcription",
  "--apply",
]) {
  if (!baseline.includes(token)) {
    console.error(`Production baseline guard is missing safety token: ${token}`);
    process.exit(1);
  }
}

console.log(`Production baseline guard covers all ${migrationNames.length} reviewed migrations.`);
