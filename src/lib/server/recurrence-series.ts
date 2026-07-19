import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import {
  addDays,
  buildRecurrenceDates,
  calendarDateFromIso,
  calendarDateToIso,
  toZonedInstant,
} from "@/lib/recurrence-engine";
import { getPrismaClient } from "@/lib/server/prisma";

export type CreateReminderSeriesInput = {
  reminderId: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval: number;
  byDay: string[];
  startsOn: string;
  endsOn: string | null;
  occurrenceLimit: number | null;
  monthEndPolicy: "clamp" | "skip" | "last_day";
  localTime: string;
};

export async function createReminderSeries(
  context: HouseholdAccessContext,
  input: CreateReminderSeriesInput,
) {
  const startsOn = calendarDateFromIso(input.startsOn);
  const endsOn = input.endsOn ? calendarDateFromIso(input.endsOn) : null;
  const horizon = addDays(startsOn, 180);
  const dates = buildRecurrenceDates(
    {
      frequency: input.frequency,
      interval: input.interval,
      byDay: input.byDay,
      dayOfMonth: startsOn.day,
      monthEndPolicy: input.monthEndPolicy,
      startsOn,
      endsOn,
      occurrenceLimit: input.occurrenceLimit,
    },
    horizon,
  );
  if (!dates.length) throw new Error("This schedule has no upcoming dates.");

  return getPrismaClient().$transaction(
    async (tx) => {
      const [actor, household, template, existing] = await Promise.all([
        tx.householdMember.findFirst({
          where: {
            id: context.memberId,
            userId: context.userId,
            householdId: context.householdId,
            status: "active",
          },
          select: { id: true },
        }),
        tx.household.findUnique({
          where: { id: context.householdId },
          select: { timezone: true },
        }),
        tx.reminder.findFirst({
          where: {
            id: input.reminderId,
            householdId: context.householdId,
            status: { not: "archived" },
          },
        }),
        tx.recurrenceSeries.findFirst({
          where: {
            householdId: context.householdId,
            targetType: "reminder",
            targetId: input.reminderId,
            state: { in: ["active", "paused"] },
          },
          select: { id: true },
        }),
      ]);
      if (!actor || !household || !template || existing) {
        throw new Error("This reminder cannot start another repeat schedule.");
      }

      const series = await tx.recurrenceSeries.create({
        data: {
          householdId: context.householdId,
          targetType: "reminder",
          targetId: template.id,
          timezone: household.timezone,
          frequency: input.frequency,
          interval: input.interval,
          byDay: input.byDay,
          dayOfMonth: startsOn.day,
          monthEndPolicy: input.monthEndPolicy,
          localTime: input.localTime,
          startsOn: new Date(`${input.startsOn}T00:00:00.000Z`),
          endsOn: input.endsOn ? new Date(`${input.endsOn}T00:00:00.000Z`) : null,
          occurrenceLimit: input.occurrenceLimit,
          nextGenerationAt: toZonedInstant(addDays(horizon, 1), input.localTime, household.timezone),
          createdByMemberId: context.memberId,
        },
      });

      for (const [index, date] of dates.entries()) {
        const scheduledFor = toZonedInstant(date, input.localTime, household.timezone);
        let generatedItemId = template.id;
        if (index === 0) {
          await tx.reminder.update({
            where: { id: template.id },
            data: {
              remindAt: scheduledFor,
              cadence: cadenceFor(input.frequency),
            },
          });
        } else {
          const generated = await tx.reminder.create({
            data: {
              householdId: context.householdId,
              title: template.title,
              notes: template.notes,
              remindAt: scheduledFor,
              cadence: cadenceFor(input.frequency),
              assignedMemberId: template.assignedMemberId,
              createdByMemberId: context.memberId,
              linkedEntityType: "reminder",
              linkedEntityId: template.id,
            },
            select: { id: true },
          });
          generatedItemId = generated.id;
        }
        await tx.recurrenceOccurrence.create({
          data: {
            householdId: context.householdId,
            seriesId: series.id,
            scheduledFor,
            localDate: calendarDateToIso(date),
            generatedItemId,
          },
        });
      }

      await tx.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "reminder",
          entityId: template.id,
          eventType: "updated",
          summary: `Added a repeat schedule to reminder: ${template.title}`,
        },
      });
      return series;
    },
    { isolationLevel: "Serializable" },
  );
}

export async function updateReminderSeriesState(
  context: HouseholdAccessContext,
  seriesId: string,
  action: "pause" | "resume" | "end",
) {
  return getPrismaClient().$transaction(async (tx) => {
    const actor = await tx.householdMember.findFirst({
      where: {
        id: context.memberId,
        userId: context.userId,
        householdId: context.householdId,
        status: "active",
      },
      select: { id: true },
    });
    const series = await tx.recurrenceSeries.findFirst({
      where: { id: seriesId, householdId: context.householdId },
      select: { id: true, targetId: true },
    });
    if (!actor || !series) throw new Error("The repeat schedule is not available.");
    const state = action === "pause" ? "paused" : action === "resume" ? "active" : "ended";
    await tx.recurrenceSeries.update({ where: { id: series.id }, data: { state } });
    if (action === "end") {
      await tx.recurrenceOccurrence.updateMany({
        where: { seriesId: series.id, state: "scheduled", scheduledFor: { gt: new Date() } },
        data: { state: "cancelled" },
      });
    }
    return series;
  });
}

function cadenceFor(frequency: CreateReminderSeriesInput["frequency"]) {
  return frequency === "weekly"
    ? "weekly" as const
    : frequency === "monthly"
      ? "monthly" as const
      : "custom" as const;
}
