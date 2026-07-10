import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { getAuthenticationMode } from "@/lib/auth/config";
import { getDemoHouseholdAccessContext } from "@/lib/server/demo-access-context";

export async function getRuntimeHouseholdAccessContext(): Promise<HouseholdAccessContext> {
  if (getAuthenticationMode() === "demo") {
    return getDemoHouseholdAccessContext();
  }

  const { requireCurrentHouseholdAccessContext } = await import("@/lib/auth/session");

  return requireCurrentHouseholdAccessContext();
}
