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

export async function createMobileInboxItem(
  context: HouseholdAccessContext,
  title: string,
  description: string | null,
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.createInboxItem(context, {
    title,
    description,
    category: "other",
    priority: "normal",
    suggestedDestination: "none",
  });
  return success();
}

export async function createMobileTask(
  context: HouseholdAccessContext,
  title: string,
  notes: string | null,
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.createTask(context, {
    title,
    notes,
    priority: "normal",
    dueAt: null,
    assignedMemberId: context.memberId,
  });
  return success();
}

export async function createMobileShoppingItem(
  context: HouseholdAccessContext,
  shoppingListId: string,
  label: string,
  notes: string | null,
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.createShoppingListItem(context, {
    shoppingListId,
    label,
    notes,
    quantity: null,
    category: null,
  });
  return success();
}

export async function createMobileReminder(
  context: HouseholdAccessContext,
  title: string,
  notes: string | null,
  remindAt: Date,
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.createReminder(context, {
    title,
    notes,
    cadence: "once",
    remindAt,
    assignedMemberId: context.memberId,
  });
  return success();
}

export async function createMobileBillOrRenewal(
  context: HouseholdAccessContext,
  input: {
    title: string;
    provider: string | null;
    type: "bill" | "renewal";
    date: Date;
    sourceReferenceId: string | null;
  },
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.createBillOrRenewal(context, {
    title: input.title,
    provider: input.provider,
    type: input.type,
    dueAt: input.type === "bill" ? input.date : null,
    renewalAt: input.type === "renewal" ? input.date : null,
    notes: null,
    sourceReferenceId: input.sourceReferenceId,
    assignedMemberId: context.memberId,
  });
  return success();
}

export async function createMobileSourceReference(
  context: HouseholdAccessContext,
  input: { title: string; label: string; url: string | null },
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.createSourceReference(context, {
    title: input.title,
    label: input.label,
    kind: input.url ? "source_link" : "source_document_reference",
    url: input.url,
  });
  return success();
}

export async function createMobileComment(
  context: HouseholdAccessContext,
  input: {
    entityType: "inbox_item" | "task" | "reminder" | "shopping_list" | "bill_or_renewal" | "source_reference";
    entityId: string;
    body: string;
  },
) {
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.createComment(context, input);
  return success();
}
