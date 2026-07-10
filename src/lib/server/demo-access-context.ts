import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { getCurrentHousehold, getCurrentMember } from "@/lib/household";

function getDemoUserId(memberId: string) {
  return `user_${memberId.replace(/^member_/, "")}`;
}

export function getDemoHouseholdAccessContext(): HouseholdAccessContext {
  const household = getCurrentHousehold();
  const member = getCurrentMember();

  return {
    userId: getDemoUserId(member.id),
    householdId: household.id,
    memberId: member.id,
    role: member.role,
  };
}
