import "server-only";

import {
  prismaHouseholdPersistenceAdapter,
  staticHouseholdPersistenceAdapter,
} from "@/lib/persistence";
import type { HouseholdPersistenceAdapter } from "@/lib/persistence";

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

export function getHouseholdPersistenceAdapter(): HouseholdPersistenceAdapter {
  const mode = getConfiguredPersistenceMode();

  if (mode === "prisma") {
    return prismaHouseholdPersistenceAdapter;
  }

  return staticHouseholdPersistenceAdapter;
}
