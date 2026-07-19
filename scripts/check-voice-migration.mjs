import { readFile } from "node:fs/promises";

const [migration, schema, app] = await Promise.all([
  readFile("prisma/migrations/20260719142500_voice_transcription/migration.sql", "utf8"),
  readFile("prisma/schema.prisma", "utf8"),
  readFile("mobile/app.json", "utf8"),
]);

const required = [
  [migration, "ADD VALUE 'speech_transcription'"],
  [schema, "speech_transcription"],
  [app, "expo-audio"],
  [app, "enableBackgroundRecording"],
];

const missing = required.filter(([content, token]) => !content.includes(token)).map(([, token]) => token);
if (missing.length) {
  console.error("Voice capture guard failed:");
  for (const token of missing) console.error(`- ${token}`);
  process.exit(1);
}
if (app.includes('"enableBackgroundRecording": true')) {
  console.error("Voice capture must not run in the background.");
  process.exit(1);
}
console.log("Voice capture guard passed.");
