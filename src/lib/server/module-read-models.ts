import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";

type MemberLookup = Map<string, string>;

type ReadModelRow = {
  id: string;
  title: string;
  detail: string;
  status: string;
  href: string;
};

type CountSummary = {
  label: string;
  value: number;
};

type ModuleReadModel = {
  household: {
    id: string;
    name: string;
    timezone: string;
  };
  counts: CountSummary[];
  rows: ReadModelRow[];
};

type ShoppingListsReadModel = ModuleReadModel & {
  lists: Array<{ id: string; name: string }>;
  items: Array<{
    id: string;
    shoppingListId: string;
    listName: string;
    label: string;
    detail: string;
    checked: boolean;
  }>;
};

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function getMemberName(members: MemberLookup, memberId: string | null | undefined) {
  if (!memberId) {
    return "Household";
  }

  return members.get(memberId) ?? "Household";
}

async function getBaseReadModel(context: HouseholdAccessContext) {
  const adapter = await getHouseholdPersistenceAdapter();
  const [household, members] = await Promise.all([adapter.getHousehold(context), adapter.listMembers(context)]);

  return {
    adapter,
    household: {
      id: household.id,
      name: household.name,
      timezone: household.timezone,
    },
    members: new Map(members.map((member) => [member.id, member.displayName])),
  };
}

export async function getInboxReadModel(
  context?: HouseholdAccessContext,
): Promise<ModuleReadModel> {
  const accessContext = context ?? (await getRuntimeHouseholdAccessContext());
  const { adapter, household, members } = await getBaseReadModel(accessContext);
  const inboxItems = await adapter.listInboxItems(accessContext);

  return {
    household,
    counts: [
      { label: "New", value: inboxItems.filter((item) => item.status === "new").length },
      { label: "Needs review", value: inboxItems.filter((item) => item.status === "needs_review").length },
      { label: "Linked", value: inboxItems.filter((item) => item.status === "linked").length },
    ],
    rows: inboxItems.map((item) => ({
      id: item.id,
      title: item.title,
      detail: `${item.description ?? "Manual household inbox item"} Assigned to ${getMemberName(members, item.assignedMemberId)}.`,
      status: formatStatus(item.status),
      href: "/inbox",
    })),
  };
}

export async function getTasksReadModel(
  context?: HouseholdAccessContext,
): Promise<ModuleReadModel> {
  const accessContext = context ?? (await getRuntimeHouseholdAccessContext());
  const { adapter, household, members } = await getBaseReadModel(accessContext);
  const [tasks, reminders] = await Promise.all([adapter.listTasks(accessContext), adapter.listReminders(accessContext)]);

  return {
    household,
    counts: [
      { label: "Open tasks", value: tasks.filter((task) => task.status === "open").length },
      { label: "Done tasks", value: tasks.filter((task) => task.status === "done").length },
      { label: "Scheduled reminders", value: reminders.filter((reminder) => reminder.status === "scheduled").length },
    ],
    rows: [
      ...tasks.map((task) => ({
        id: task.id,
        title: task.title,
        detail: `${task.notes ?? "Household task"} Assigned to ${getMemberName(members, task.assignedMemberId)}.`,
        status: formatStatus(task.status),
        href: "/tasks",
      })),
      ...reminders.map((reminder) => ({
        id: reminder.id,
        title: reminder.title,
        detail: `${reminder.notes ?? "Household reminder"} Assigned to ${getMemberName(members, reminder.assignedMemberId)}.`,
        status: formatStatus(reminder.status),
        href: "/tasks",
      })),
    ],
  };
}

export async function getShoppingListsReadModel(
  context?: HouseholdAccessContext,
): Promise<ShoppingListsReadModel> {
  const accessContext = context ?? (await getRuntimeHouseholdAccessContext());
  const { adapter, household, members } = await getBaseReadModel(accessContext);
  const [shoppingLists, shoppingItems] = await Promise.all([
    adapter.listShoppingLists(accessContext),
    adapter.listShoppingListItems(accessContext),
  ]);
  const listNames = new Map(shoppingLists.map((list) => [list.id, list.name]));

  return {
    household,
    counts: [
      { label: "Active lists", value: shoppingLists.filter((list) => list.status === "active").length },
      { label: "Open items", value: shoppingItems.filter((item) => !item.checked).length },
      { label: "Total items", value: shoppingItems.length },
    ],
    rows: shoppingLists.map((list) => ({
      id: list.id,
      title: list.name,
      detail: `${list.openItemCount} open of ${list.totalItemCount}. Created by ${getMemberName(members, list.createdByMemberId)}.`,
      status: formatStatus(list.status),
      href: "/lists",
    })),
    lists: shoppingLists
      .filter((list) => list.status === "active")
      .map((list) => ({ id: list.id, name: list.name })),
    items: shoppingItems.map((item) => ({
      id: item.id,
      shoppingListId: item.shoppingListId,
      listName: listNames.get(item.shoppingListId) ?? "Shopping list",
      label: item.label,
      detail: [item.quantity, item.category, item.notes].filter(Boolean).join(" - "),
      checked: item.checked,
    })),
  };
}

export async function getBillsAndRenewalsReadModel(
  context?: HouseholdAccessContext,
): Promise<ModuleReadModel> {
  const accessContext = context ?? (await getRuntimeHouseholdAccessContext());
  const { adapter, household, members } = await getBaseReadModel(accessContext);
  const billsAndRenewals = await adapter.listBillsAndRenewals(accessContext);

  return {
    household,
    counts: [
      { label: "Bills", value: billsAndRenewals.filter((item) => item.type === "bill").length },
      { label: "Renewals", value: billsAndRenewals.filter((item) => item.type === "renewal").length },
      { label: "Needs review", value: billsAndRenewals.filter((item) => item.status === "needs_review").length },
    ],
    rows: billsAndRenewals.map((item) => ({
      id: item.id,
      title: item.title,
      detail: `${item.provider ?? "Provider"}. Assigned to ${getMemberName(members, item.assignedMemberId)}. Open the original source before household action.`,
      status: formatStatus(item.status),
      href: "/bills",
    })),
  };
}

export async function getSourceReferencesReadModel(
  context?: HouseholdAccessContext,
): Promise<ModuleReadModel> {
  const accessContext = context ?? (await getRuntimeHouseholdAccessContext());
  const { adapter, household, members } = await getBaseReadModel(accessContext);
  const sourceReferences = await adapter.listSourceReferences(accessContext);

  return {
    household,
    counts: [
      { label: "Sources", value: sourceReferences.length },
      { label: "Needs review", value: sourceReferences.filter((source) => source.reviewStatus === "needs_review").length },
      { label: "Sensitive", value: sourceReferences.filter((source) => source.sensitivity === "sensitive").length },
    ],
    rows: sourceReferences.map((source) => ({
      id: source.id,
      title: source.title,
      detail: `${source.label}. Created by ${getMemberName(members, source.createdByMemberId)}.`,
      status: formatStatus(source.reviewStatus),
      href: "/sources",
    })),
  };
}

export async function getActivityReadModel(
  context?: HouseholdAccessContext,
): Promise<ModuleReadModel> {
  const accessContext = context ?? (await getRuntimeHouseholdAccessContext());
  const { adapter, household, members } = await getBaseReadModel(accessContext);
  const [comments, activity] = await Promise.all([adapter.listComments(accessContext), adapter.listActivity(accessContext)]);

  return {
    household,
    counts: [
      { label: "Comments", value: comments.length },
      { label: "Activity", value: activity.length },
      { label: "Household notes", value: comments.length + activity.length },
    ],
    rows: [
      ...comments.map((comment) => ({
        id: comment.id,
        title: formatStatus(comment.entityType),
        detail: `${comment.body} Created by ${getMemberName(members, comment.createdByMemberId)}.`,
        status: "Comment",
        href: "/activity",
      })),
      ...activity.map((event) => ({
        id: event.id,
        title: event.summary,
        detail: `Recorded by ${getMemberName(members, event.actorMemberId)}.`,
        status: formatStatus(event.eventType),
        href: "/activity",
      })),
    ],
  };
}
