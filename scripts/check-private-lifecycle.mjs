import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sourceAssets = await readFile(new URL("../src/lib/server/source-assets.ts", import.meta.url), "utf8");
const intakeDrafts = await readFile(new URL("../src/lib/server/intake-drafts.ts", import.meta.url), "utf8");
const notifications = await readFile(new URL("../src/lib/server/notifications.ts", import.meta.url), "utf8");
const maintenance = await readFile(new URL("../src/lib/server/maintenance.ts", import.meta.url), "utf8");
const maintenanceRoute = await readFile(
  new URL("../src/app/api/internal/maintenance/cleanup/route.ts", import.meta.url),
  "utf8",
);

assert.match(
  intakeDrafts,
  /channel: asset\.mediaType[\s\S]{0,250}state: "received"[\s\S]{0,150}attemptCount: 0/,
  "Document intake must begin claimable rather than becoming permanently processing.",
);
assert.match(
  intakeDrafts,
  /sourceAsset\.updateMany\([\s\S]{0,450}data: \{ retentionUntil: null \}/,
  "Only confirmation may remove an original source expiry.",
);
assert.match(
  sourceAssets,
  /: asset\.retentionUntil/,
  "Finalizing an unconfirmed source must preserve its expiry.",
);
assert.match(
  sourceAssets,
  /\["pending", "quarantined", "ready", "rejected", "deleting"\]/,
  "Cleanup must cover every temporary or retryable source state.",
);
assert.match(
  sourceAssets,
  /state: "deleting"[\s\S]{0,150}retentionUntil:/,
  "Provider deletion failures must remain retryable.",
);
assert.match(
  sourceAssets,
  /state: "deleted"[\s\S]{0,120}deletedAt:/,
  "Provider-confirmed deletion must be recorded as deleted.",
);
assert.match(
  notifications,
  /isDeliveryStillEligible[\s\S]{0,800}state: "suppressed"/,
  "Notification delivery must recheck current eligibility and suppress stale work.",
);
assert.match(
  maintenanceRoute,
  /isAuthorizedInternalRequest\(request\)/,
  "Private maintenance must use strong internal authentication.",
);
assert.match(
  maintenance,
  /intakeDraft\.updateMany[\s\S]{0,250}state: "expired"/,
  "Expired unconfirmed intake drafts must become inaccessible.",
);

console.log("Private lifecycle and recovery guardrails passed.");
