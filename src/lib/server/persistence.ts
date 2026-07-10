import "server-only";

import { staticHouseholdPersistenceAdapter } from "@/lib/persistence/static-adapter";
import type { HouseholdPersistenceAdapter } from "@/lib/persistence/contracts";

export type PersistenceMode = "static" | "prisma";

const persistenceModes = new Set<string>(["static", "prisma"]);

export function getConfiguredPersistenceMode(): PersistenceMode {
  const configuredMode = process.env.FAMILY_LIFE_ADMIN_PERSISTENCE_MODE;

  if (!configuredMode) {
    return "static";
  }

  if (!persistenceModes.has(configuredMode)) {
    throw new Error(`Unsupported persistence mode: ${configuredMode}`);
  }

  return configuredMode as PersistenceMode;
}

export async function getHouseholdPersistenceAdapter(): Promise<HouseholdPersistenceAdapter> {
  const mode = getConfiguredPersistenceMode();

  if (mode === "prisma") {
    const { prismaHouseholdPersistenceAdapter } = await import("@/lib/persistence/prisma-adapter");

    return prismaHouseholdPersistenceAdapter;
  }

  return staticHouseholdPersistenceAdapter;
}
