import assert from "node:assert/strict";
import test from "node:test";
import {
  genericNotificationContent,
  isQuietTime,
  nextAllowedTime,
  notificationDedupeKey,
} from "../src/lib/notification-policy.ts";

test("overnight quiet hours work in the household timezone", () => {
  assert.equal(isQuietTime(new Date("2026-07-19T13:30:00Z"), "Australia/Brisbane", "21:00", "07:00"), true);
  assert.equal(isQuietTime(new Date("2026-07-19T23:30:00Z"), "Australia/Brisbane", "21:00", "07:00"), false);
});

test("daytime quiet ranges work without crossing midnight", () => {
  assert.equal(isQuietTime(new Date("2026-07-19T02:30:00Z"), "Australia/Brisbane", "12:00", "14:00"), true);
  assert.equal(isQuietTime(new Date("2026-07-19T05:30:00Z"), "Australia/Brisbane", "12:00", "14:00"), false);
});

test("quiet notifications are delayed until the allowed period", () => {
  const now = new Date("2026-07-19T13:30:00Z");
  const allowed = nextAllowedTime(now, "Australia/Brisbane", "21:00", "07:00");
  assert.equal(allowed.toISOString(), "2026-07-19T21:00:00.000Z");
});

test("delivery keys are stable and installation-specific", () => {
  const scheduledFor = new Date("2026-07-20T01:00:00Z");
  const first = notificationDedupeKey({ installationId: "one", kind: "task", targetId: "task-1", scheduledFor });
  assert.equal(first, notificationDedupeKey({ installationId: "one", kind: "task", targetId: "task-1", scheduledFor }));
  assert.notEqual(first, notificationDedupeKey({ installationId: "two", kind: "task", targetId: "task-1", scheduledFor }));
});

test("private content is generic unless previews are explicitly enabled", () => {
  const privateContent = genericNotificationContent("bill", false, "Electricity bill");
  assert.equal(privateContent.title, "Family Life Admin");
  assert.equal(privateContent.body.includes("Electricity"), false);
  assert.equal(privateContent.data.path, "/bills");

  const preview = genericNotificationContent("bill", true, "Electricity bill");
  assert.equal(preview.body, "Electricity bill");
});
