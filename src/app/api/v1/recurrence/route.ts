import {
  requireEnum,
  requireId,
  requireText,
  readJsonObject,
} from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import type { MobileRecurrenceResponse } from "@/lib/api/v1/contracts";
import {
  createReminderSeries,
  getReminderSeries,
} from "@/lib/server/recurrence-series";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return withHouseholdApi(async (context) => {
    const reminderId = requireId(new URL(request.url).searchParams.get("reminderId") ?? undefined);
    return response(await getReminderSeries(context, reminderId));
  });
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const reminderId = requireId(typeof input.reminderId === "string" ? input.reminderId : undefined);
    const frequency = requireEnum(input, "frequency", [
      "daily", "weekly", "monthly", "yearly", "custom",
    ] as const);
    const monthEndPolicy = requireEnum(input, "monthEndPolicy", [
      "clamp", "skip", "last_day",
    ] as const);
    const startsOn = readCalendarDate(input, "startsOn", true)!;
    const endsOn = readCalendarDate(input, "endsOn", false);
    const interval = readInteger(input, "interval", 1, 365);
    const occurrenceLimit = readOptionalInteger(input, "occurrenceLimit", 1, 100);
    const localTime = requireText(input, "localTime", 5, 5);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(localTime)) {
      throw new MobileApiRequestError("Choose a valid reminder time.");
    }
    const byDay = readWeekdays(input.byDay);

    await createReminderSeries(context, {
      reminderId,
      frequency,
      interval,
      byDay,
      startsOn,
      endsOn,
      occurrenceLimit,
      monthEndPolicy,
      localTime,
    });
    return response(await getReminderSeries(context, reminderId));
  });
}

function response(series: MobileRecurrenceResponse["series"]): MobileRecurrenceResponse {
  return { apiVersion: "1", generatedAt: new Date().toISOString(), series };
}

function readInteger(input: Record<string, unknown>, field: string, minimum: number, maximum: number) {
  const value = input[field];
  if (!Number.isInteger(value) || (value as number) < minimum || (value as number) > maximum) {
    throw new MobileApiRequestError(`${field} must be between ${minimum} and ${maximum}.`);
  }
  return value as number;
}

function readOptionalInteger(input: Record<string, unknown>, field: string, minimum: number, maximum: number) {
  if (input[field] === null || input[field] === undefined || input[field] === "") return null;
  return readInteger(input, field, minimum, maximum);
}

function readCalendarDate(input: Record<string, unknown>, field: string, required: boolean) {
  const value = input[field];
  if (!required && (value === null || value === undefined || value === "")) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new MobileApiRequestError(`${field} must be a valid date.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new MobileApiRequestError(`${field} must be a valid date.`);
  }
  return value;
}

function readWeekdays(value: unknown) {
  const allowed = new Set(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]);
  if (!Array.isArray(value) || value.some((day) => typeof day !== "string" || !allowed.has(day))) {
    throw new MobileApiRequestError("Choose valid repeat days.");
  }
  return [...new Set(value as string[])];
}
