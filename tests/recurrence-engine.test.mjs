import assert from "node:assert/strict";
import test from "node:test";
import {
  buildRecurrenceDates,
  calendarDateToIso,
  toZonedInstant,
} from "../src/lib/recurrence-engine.ts";

const base = {
  interval: 1,
  byDay: [],
  dayOfMonth: null,
  monthEndPolicy: "clamp",
  startsOn: { year: 2026, month: 1, day: 31 },
  endsOn: null,
  occurrenceLimit: 4,
};

test("daily recurrence is bounded and ordered", () => {
  const dates = buildRecurrenceDates(
    { ...base, frequency: "daily" },
    { year: 2026, month: 12, day: 31 },
  );
  assert.deepEqual(dates.map(calendarDateToIso), [
    "2026-01-31", "2026-02-01", "2026-02-02", "2026-02-03",
  ]);
});

test("weekly recurrence honors selected weekdays", () => {
  const dates = buildRecurrenceDates(
    { ...base, frequency: "weekly", byDay: ["MO", "FR"] },
    { year: 2026, month: 2, day: 28 },
  );
  assert.deepEqual(dates.map(calendarDateToIso), [
    "2026-02-02", "2026-02-06", "2026-02-09", "2026-02-13",
  ]);
});

test("monthly clamp uses the last valid day", () => {
  const dates = buildRecurrenceDates(
    { ...base, frequency: "monthly" },
    { year: 2026, month: 5, day: 31 },
  );
  assert.deepEqual(dates.map(calendarDateToIso), [
    "2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30",
  ]);
});

test("monthly skip does not invent an invalid date", () => {
  const dates = buildRecurrenceDates(
    { ...base, frequency: "monthly", monthEndPolicy: "skip" },
    { year: 2026, month: 7, day: 31 },
  );
  assert.deepEqual(dates.map(calendarDateToIso), [
    "2026-01-31", "2026-03-31", "2026-05-31", "2026-07-31",
  ]);
});

test("zoned conversion preserves local wall-clock time through DST", () => {
  const before = toZonedInstant({ year: 2026, month: 3, day: 7 }, "09:00", "America/New_York");
  const after = toZonedInstant({ year: 2026, month: 3, day: 9 }, "09:00", "America/New_York");
  assert.equal(after.getTime() - before.getTime(), 47 * 60 * 60 * 1000);
});
