export type CalendarDate = {
  year: number;
  month: number;
  day: number;
};

export type RecurrencePattern = {
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval: number;
  byDay: string[];
  dayOfMonth: number | null;
  monthEndPolicy: "clamp" | "skip" | "last_day";
  startsOn: CalendarDate;
  endsOn: CalendarDate | null;
  occurrenceLimit: number | null;
};

const weekdayCodes = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;

export function buildRecurrenceDates(
  pattern: RecurrencePattern,
  horizon: CalendarDate,
  maximum = 100,
) {
  const limit = Math.min(pattern.occurrenceLimit ?? maximum, maximum);
  if (pattern.interval < 1 || pattern.interval > 365 || limit < 1) return [];

  const end = earlierDate(pattern.endsOn, horizon);
  const dates: CalendarDate[] = [];

  switch (pattern.frequency) {
    case "daily":
      for (
        let cursor = pattern.startsOn;
        compareDate(cursor, end) <= 0 && dates.length < limit;
        cursor = addDays(cursor, pattern.interval)
      ) {
        dates.push(cursor);
      }
      break;
    case "weekly":
    case "custom": {
      const selected = new Set(
        pattern.byDay.length
          ? pattern.byDay
          : [weekdayCodes[weekday(pattern.startsOn)]],
      );
      for (
        let cursor = pattern.startsOn;
        compareDate(cursor, end) <= 0 && dates.length < limit;
        cursor = addDays(cursor, 1)
      ) {
        const weeks = Math.floor(
          daysBetween(pattern.startsOn, cursor) / 7,
        );
        if (
          weeks % pattern.interval === 0 &&
          selected.has(weekdayCodes[weekday(cursor)])
        ) {
          dates.push(cursor);
        }
      }
      break;
    }
    case "monthly": {
      const requestedDay = pattern.dayOfMonth ?? pattern.startsOn.day;
      for (let offset = 0; dates.length < limit; offset += pattern.interval) {
        const month = addMonths(pattern.startsOn, offset);
        const candidate = resolveMonthDay(
          month.year,
          month.month,
          requestedDay,
          pattern.monthEndPolicy,
        );
        if (!candidate) continue;
        if (compareDate(candidate, pattern.startsOn) < 0) continue;
        if (compareDate(candidate, end) > 0) break;
        dates.push(candidate);
      }
      break;
    }
    case "yearly":
      for (let offset = 0; dates.length < limit; offset += pattern.interval) {
        const year = pattern.startsOn.year + offset;
        const candidate = resolveMonthDay(
          year,
          pattern.startsOn.month,
          pattern.dayOfMonth ?? pattern.startsOn.day,
          pattern.monthEndPolicy,
        );
        if (!candidate) continue;
        if (compareDate(candidate, end) > 0) break;
        dates.push(candidate);
      }
      break;
  }

  return dates;
}

export function calendarDateFromIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) throw new Error("A valid calendar date is required.");
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function calendarDateToIso(value: CalendarDate) {
  return [
    String(value.year).padStart(4, "0"),
    String(value.month).padStart(2, "0"),
    String(value.day).padStart(2, "0"),
  ].join("-");
}

export function addDays(value: CalendarDate, days: number): CalendarDate {
  const date = new Date(Date.UTC(value.year, value.month - 1, value.day + days));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

export function addMonths(value: CalendarDate, months: number): CalendarDate {
  const date = new Date(Date.UTC(value.year, value.month - 1 + months, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: 1,
  };
}

export function toZonedInstant(
  date: CalendarDate,
  localTime: string,
  timezone: string,
) {
  const match = /^(\d{2}):(\d{2})$/.exec(localTime);
  if (!match) throw new Error("A valid local time is required.");
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) throw new Error("A valid local time is required.");

  const target = Date.UTC(date.year, date.month - 1, date.day, hour, minute);
  let guess = target;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(guess));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const represented = Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
    );
    const adjustment = target - represented;
    guess += adjustment;
    if (adjustment === 0) break;
  }

  return new Date(guess);
}

function resolveMonthDay(
  year: number,
  month: number,
  requestedDay: number,
  policy: RecurrencePattern["monthEndPolicy"],
) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (policy === "last_day") {
    return { year, month, day: lastDay };
  }
  if (requestedDay > lastDay && policy === "skip") return null;
  return { year, month, day: Math.min(requestedDay, lastDay) };
}

function weekday(value: CalendarDate) {
  return new Date(Date.UTC(value.year, value.month - 1, value.day)).getUTCDay();
}

function daysBetween(start: CalendarDate, end: CalendarDate) {
  const startTime = Date.UTC(start.year, start.month - 1, start.day);
  const endTime = Date.UTC(end.year, end.month - 1, end.day);
  return Math.floor((endTime - startTime) / 86_400_000);
}

function earlierDate(
  left: CalendarDate | null,
  right: CalendarDate,
) {
  return left && compareDate(left, right) < 0 ? left : right;
}

function compareDate(left: CalendarDate, right: CalendarDate) {
  return (
    Date.UTC(left.year, left.month - 1, left.day) -
    Date.UTC(right.year, right.month - 1, right.day)
  );
}
