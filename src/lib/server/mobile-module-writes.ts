import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import type { MobileMutationResponse } from "@/lib/api/v1/contracts";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";

function success(): MobileMutationResponse {
  return {
    apiVersion: "1",
    generatedAt: new Date().toISOString(),
    success: true,
  };
}

export async function setMobileWorkCompleted(
  context: HouseholdAccessContext,
  itemId: string,
  entityType: "task" | "reminder",
  completed: boolean,
) {
  const adapter = await getHouseholdPersistenceAdapter();
  if (entityType === "task") {
    await adapter.setTaskCompleted(context, itemId, completed);
  } else {
    await adapter.setReminderCompleted(context, itemId, completed);
  }
  return success();
}

export async function setMobileShoppingItemChecked(
  context: HouseholdAccessContext,
  itemId: string,
  checked: boolean,
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.setShoppingListItemChecked(context, itemId, checked);
  return success();
}

export async function setMobileInboxItemArchived(
  context: HouseholdAccessContext,
  itemId: string,
  archived: boolean,
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.setInboxItemArchived(context, itemId, archived);
  return success();
}

export async function setMobileBillCompleted(
  context: HouseholdAccessContext,
  itemId: string,
  completed: boolean,
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.setBillOrRenewalCompleted(context, itemId, completed);
  return success();
}

export async function setMobileSourceReviewStatus(
  context: HouseholdAccessContext,
  sourceId: string,
  status: "needs_review" | "confirmed" | "archived",
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.setSourceReferenceReviewStatus(context, sourceId, status);
  return success();
}
