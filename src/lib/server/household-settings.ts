import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { requireHouseholdPermission } from "@/lib/access-control";
import { getPrismaClient } from "@/lib/server/prisma";

export const householdTimezones = [
  "Australia/Brisbane",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Adelaide",
  "Australia/Perth",
  "Australia/Darwin",
  "Australia/Hobart",
] as const;

export type HouseholdTimezone = (typeof householdTimezones)[number];

export class HouseholdSettingsError extends Error {
  constructor(message = "Household details could not be updated.") {
    super(message);
    this.name = "HouseholdSettingsError";
  }
}

export async function updateHouseholdProfile(
  context: HouseholdAccessContext,
  name: string,
  timezone: HouseholdTimezone,
) {
  requireHouseholdPermission(context, "manage_household_settings");

  await getPrismaClient().$transaction(async (tx) => {
    const admin = await tx.householdMember.findFirst({
      where: {
        id: context.memberId,
        householdId: context.householdId,
        userId: context.userId,
        role: "household_admin",
        status: "active",
      },
      select: { id: true },
    });
    if (!admin) throw new HouseholdSettingsError();

    const household = await tx.household.update({
      where: { id: context.householdId },
      data: { name, timezone },
      select: { id: true },
    });

    await tx.householdSettings.upsert({
      where: { householdId: context.householdId },
      update: { defaultTimezone: timezone },
      create: {
        householdId: context.householdId,
        defaultTimezone: timezone,
      },
    });

    await tx.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType: "household",
        entityId: household.id,
        eventType: "updated",
        summary: "Updated household details.",
      },
    });
  });
}

export function isHouseholdTimezone(value: string): value is HouseholdTimezone {
  return householdTimezones.includes(value as HouseholdTimezone);
}
