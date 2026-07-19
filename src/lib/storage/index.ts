import "server-only";

import type { PrivateObjectStorage } from "@/lib/storage/contracts";

let storage: PrivateObjectStorage | undefined;

export async function getPrivateObjectStorage(): Promise<PrivateObjectStorage> {
  if (!storage) {
    const { R2PrivateObjectStorage } = await import("@/lib/storage/r2");
    storage = new R2PrivateObjectStorage();
  }
  return storage;
}
