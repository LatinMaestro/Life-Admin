import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import type {
  MobileActivityResponse,
  MobileBillsResponse,
  MobileInboxResponse,
  MobileShoppingResponse,
  MobileSourceReference,
  MobileSourcesResponse,
  MobileTasksResponse,
} from "@/lib/api/v1/contracts";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";

function envelope() {
  return {
    apiVersion: "1" as const,
    generatedAt: new Date().toISOString(),
  };
}

function toIso(value: Date | null | undefined) {
  return value?.toISOString() ?? null;
}

function toSafeSourceUrl(value: string | null | undefined) {
  return value?.startsWith("https://") ? value : null;
}

function toMobileSource(
  source: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof getHouseholdPersistenceAdapter>>["listSourceReferences"]
    >
  >[number],
): MobileSourceReference {
  return {
    id: source.id,
    title: source.title,
    kind: source.kind,
    label: source.label,
    url: toSafeSourceUrl(source.url),
    reviewStatus: source.reviewStatus,
    sensitivity: source.sensitivity,
    createdByMemberId: source.createdByMemberId,
  };
}

export async function getMobileInbox(
  context: HouseholdAccessContext,
): Promise<MobileInboxResponse> {
  const adapter = await getHouseholdPersistenceAdapter();
  const items = await adapter.listInboxItems(context);

  return {
    ...envelope(),
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? null,
      status: item.status,
      category: item.category,
      priority: item.priority,
      assignedMemberId: item.assignedMemberId ?? null,
      createdByMemberId: item.createdByMemberId,
      sourceReferenceId: item.sourceReferenceId ?? null,
    })),
  };
}

export async function getMobileTasks(
  context: HouseholdAccessContext,
): Promise<MobileTasksResponse> {
  const adapter = await getHouseholdPersistenceAdapter();
  const [tasks, reminders] = await Promise.all([
    adapter.listTasks(context),
    adapter.listReminders(context),
  ]);

  return {
    ...envelope(),
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      notes: task.notes ?? null,
      status: task.status,
      stage: task.stage,
      priority: task.priority,
      dueAt: toIso(task.dueAt),
      assignedMemberId: task.assignedMemberId ?? null,
      createdByMemberId: task.createdByMemberId,
      sourceReferenceId: task.sourceReferenceId ?? null,
    })),
    reminders: reminders.map((reminder) => ({
      id: reminder.id,
      title: reminder.title,
      notes: reminder.notes ?? null,
      status: reminder.status,
      cadence: reminder.cadence,
      remindAt: toIso(reminder.remindAt),
      assignedMemberId: reminder.assignedMemberId ?? null,
      createdByMemberId: reminder.createdByMemberId,
    })),
  };
}

export async function getMobileShopping(
  context: HouseholdAccessContext,
): Promise<MobileShoppingResponse> {
  const adapter = await getHouseholdPersistenceAdapter();
  const [lists, items] = await Promise.all([
    adapter.listShoppingLists(context),
    adapter.listShoppingListItems(context),
  ]);
  const activeListIds = new Set(
    lists.filter((list) => list.status === "active").map((list) => list.id),
  );

  return {
    ...envelope(),
    lists: lists.map((list) => ({
      id: list.id,
      name: list.name,
      status: list.status,
      createdByMemberId: list.createdByMemberId,
      openItemCount: list.openItemCount,
      totalItemCount: list.totalItemCount,
    })),
    items: items
      .filter((item) => activeListIds.has(item.shoppingListId))
      .map((item) => ({
        id: item.id,
        shoppingListId: item.shoppingListId,
        label: item.label,
        notes: item.notes ?? null,
        quantity: item.quantity ?? null,
        category: item.category ?? null,
        checked: item.checked,
        assignedMemberId: item.assignedMemberId ?? null,
        createdByMemberId: item.createdByMemberId,
      })),
  };
}

export async function getMobileBills(
  context: HouseholdAccessContext,
): Promise<MobileBillsResponse> {
  const adapter = await getHouseholdPersistenceAdapter();
  const [items, sources] = await Promise.all([
    adapter.listBillsAndRenewals(context),
    adapter.listSourceReferences(context),
  ]);

  return {
    ...envelope(),
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      provider: item.provider ?? null,
      type: item.type,
      status: item.status,
      dueAt: toIso(item.dueAt),
      renewalAt: toIso(item.renewalAt),
      assignedMemberId: item.assignedMemberId ?? null,
      createdByMemberId: item.createdByMemberId,
      sourceReferenceId: item.sourceReferenceId ?? null,
    })),
    sources: sources.map(toMobileSource),
  };
}

export async function getMobileSources(
  context: HouseholdAccessContext,
): Promise<MobileSourcesResponse> {
  const adapter = await getHouseholdPersistenceAdapter();
  const sources = await adapter.listSourceReferences(context);

  return {
    ...envelope(),
    sources: sources.map(toMobileSource),
  };
}

export async function getMobileActivity(
  context: HouseholdAccessContext,
): Promise<MobileActivityResponse> {
  const adapter = await getHouseholdPersistenceAdapter();
  const [comments, events, inbox, tasks, reminders, lists, bills, sources] = await Promise.all([
    adapter.listComments(context),
    adapter.listActivity(context),
    adapter.listInboxItems(context),
    adapter.listTasks(context),
    adapter.listReminders(context),
    adapter.listShoppingLists(context),
    adapter.listBillsAndRenewals(context),
    adapter.listSourceReferences(context),
  ]);

  const targets: MobileActivityResponse["targets"] = [
    ...inbox.filter((item) => item.status !== "archived").map((item) => ({
      entityType: "inbox_item" as const, entityId: item.id, label: item.title, group: "Inbox",
    })),
    ...tasks.filter((item) => item.status !== "done" && item.status !== "completed").map((item) => ({
      entityType: "task" as const, entityId: item.id, label: item.title, group: "Tasks",
    })),
    ...reminders.filter((item) => item.status !== "done" && item.status !== "completed").map((item) => ({
      entityType: "reminder" as const, entityId: item.id, label: item.title, group: "Reminders",
    })),
    ...lists.filter((item) => item.status === "active").map((item) => ({
      entityType: "shopping_list" as const, entityId: item.id, label: item.name, group: "Shopping",
    })),
    ...bills.filter((item) => item.status !== "done" && item.status !== "completed").map((item) => ({
      entityType: "bill_or_renewal" as const, entityId: item.id, label: item.title, group: "Bills & renewals",
    })),
    ...sources.filter((item) => item.reviewStatus !== "archived").map((item) => ({
      entityType: "source_reference" as const, entityId: item.id, label: item.title, group: "Sources",
    })),
  ];

  return {
    ...envelope(),
    comments: comments.map((comment) => ({
      id: comment.id,
      entityType: comment.entityType,
      entityId: comment.entityId,
      body: comment.body,
      createdByMemberId: comment.createdByMemberId,
      createdAt: comment.createdAt.toISOString(),
    })),
    events: events.map((event) => ({
      id: event.id,
      entityType: event.entityType,
      entityId: event.entityId ?? null,
      eventType: event.eventType,
      summary: event.summary,
      actorMemberId: event.actorMemberId ?? null,
      createdAt: event.createdAt.toISOString(),
    })),
    targets,
  };
}
