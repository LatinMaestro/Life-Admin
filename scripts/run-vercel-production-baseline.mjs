import { spawnSync } from "node:child_process";

if (process.env.VERCEL_ENV !== "production") {
  console.log("Skipping the production migration baseline outside a Vercel production build.");
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  ["scripts/baseline-production-migrations.mjs", "--apply"],
  {
    env: process.env,
    stdio: "inherit",
  },
);

if (result.error || result.status !== 0) {
  console.error("The guarded production migration baseline did not complete.");
  process.exit(1);
}
