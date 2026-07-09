import "server-only";

import { HouseholdAccessError } from "@/lib/access-control";
import type { HouseholdAccessContext } from "@/lib/access-control";
import { prisma } from "@/lib/server/prisma";

interface ResolveHouseholdAccessOptions {
  userId: string;
  householdId?: string | null;
}

export async function resolveHouseholdAccessContext({
  userId,
  householdId,
}: ResolveHouseholdAccessOptions): Promise<HouseholdAccessContext | null> {
  const membership = await prisma.householdMember.findFirst({
    where: {
      userId,
      status: "active",
      ...(householdId ? { householdId } : {}),
    },
    orderBy: { joinedAt: "asc" },
    select: {
      id: true,
      householdId: true,
      role: true,
    },
  });

  if (!membership) {
    return null;
  }

  return {
    userId,
    householdId: membership.householdId,
    memberId: membership.id,
    role: membership.role,
  };
}

export async function requireHouseholdAccessContext(
  options: ResolveHouseholdAccessOptions,
): Promise<HouseholdAccessContext> {
  const context = await resolveHouseholdAccessContext(options);

  if (!context) {
    throw new HouseholdAccessError();
  }

  return context;
}
