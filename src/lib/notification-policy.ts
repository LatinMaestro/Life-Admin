import { createHash } from "node:crypto";

export type NotificationKind =
  | "task"
  | "reminder"
  | "bill"
  | "renewal"
  | "recurrence"
  | "intake_ready";

export function isValidQuietTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function isQuietTime(
  now: Date,
  timezone: string,
  quietStart: string,
  quietEnd: string,
) {
  if (!isValidQuietTime(quietStart) || !isValidQuietTime(quietEnd)) return false;
  if (quietStart === quietEnd) return false;
  const local = new Intl.DateTimeFormat("en-AU", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return quietStart < quietEnd
    ? local >= quietStart && local < quietEnd
    : local >= quietStart || local < quietEnd;
}

export function nextAllowedTime(
  now: Date,
  timezone: string,
  quietStart: string,
  quietEnd: string,
) {
  if (!isQuietTime(now, timezone, quietStart, quietEnd)) return now;
  const candidate = new Date(now);
  for (let minute = 1; minute <= 24 * 60; minute += 1) {
    candidate.setTime(now.getTime() + minute * 60_000);
    if (!isQuietTime(candidate, timezone, quietStart, quietEnd)) return candidate;
  }
  return new Date(now.getTime() + 24 * 60 * 60_000);
}

export function notificationDedupeKey(input: {
  installationId: string;
  kind: NotificationKind;
  targetId: string;
  scheduledFor: Date;
}) {
  return createHash("sha256")
    .update([
      input.installationId,
      input.kind,
      input.targetId,
      input.scheduledFor.toISOString(),
    ].join(":"))
    .digest("hex");
}

export function genericNotificationContent(
  kind: NotificationKind,
  showPreview: boolean,
  safeTitle: string,
) {
  const generic = {
    task: { body: "A household task is due.", path: "/tasks" },
    reminder: { body: "A household reminder is due.", path: "/tasks" },
    bill: { body: "A bill reminder is due. Open the original source before acting.", path: "/bills" },
    renewal: { body: "A renewal reminder is due. Open the original source before acting.", path: "/bills" },
    recurrence: { body: "A repeating household item is due.", path: "/tasks" },
    intake_ready: { body: "A household item is ready to review.", path: "/inbox" },
  }[kind];

  return {
    title: "Family Life Admin",
    body: showPreview && safeTitle.trim() ? safeTitle.trim().slice(0, 100) : generic.body,
    data: { path: generic.path },
  };
}
