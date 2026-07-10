import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { getAuthenticationMode } from "@/lib/auth/config";
import { requireCurrentHouseholdAccessContext } from "@/lib/auth/session";
import { getDemoHouseholdAccessContext } from "@/lib/server/demo-access-context";

export async function getRuntimeHouseholdAccessContext(): Promise<HouseholdAccessContext> {
  if (getAuthenticationMode() === "demo") {
    return getDemoHouseholdAccessContext();
  }

  return requireCurrentHouseholdAccessContext();
}
