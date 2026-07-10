import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { getDemoHouseholdAccessContext } from "@/lib/server/demo-access-context";
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
  const adapter = getHouseholdPersistenceAdapter();
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
  context: HouseholdAccessContext = getDemoHouseholdAccessContext(),
): Promise<ModuleReadModel> {
  const { adapter, household, members } = await getBaseReadModel(context);
  const inboxItems = await adapter.listInboxItems(context);

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
  context: HouseholdAccessContext = getDemoHouseholdAccessContext(),
): Promise<ModuleReadModel> {
  const { adapter, household, members } = await getBaseReadModel(context);
  const [tasks, reminders] = await Promise.all([adapter.listTasks(context), adapter.listReminders(context)]);

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
  context: HouseholdAccessContext = getDemoHouseholdAccessContext(),
): Promise<ModuleReadModel> {
  const { adapter, household, members } = await getBaseReadModel(context);
  const shoppingLists = await adapter.listShoppingLists(context);

  return {
    household,
    counts: [
      { label: "Active lists", value: shoppingLists.filter((list) => list.status === "active").length },
      { label: "Open items", value: shoppingLists.reduce((total, list) => total + list.openItemCount, 0) },
      { label: "Total items", value: shoppingLists.reduce((total, list) => total + list.totalItemCount, 0) },
    ],
    rows: shoppingLists.map((list) => ({
      id: list.id,
      title: list.name,
      detail: `${list.openItemCount} open of ${list.totalItemCount}. Created by ${getMemberName(members, list.createdByMemberId)}.`,
      status: formatStatus(list.status),
      href: "/lists",
    })),
  };
}

export async function getBillsAndRenewalsReadModel(
  context: HouseholdAccessContext = getDemoHouseholdAccessContext(),
): Promise<ModuleReadModel> {
  const { adapter, household, members } = await getBaseReadModel(context);
  const billsAndRenewals = await adapter.listBillsAndRenewals(context);

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
  context: HouseholdAccessContext = getDemoHouseholdAccessContext(),
): Promise<ModuleReadModel> {
  const { adapter, household, members } = await getBaseReadModel(context);
  const sourceReferences = await adapter.listSourceReferences(context);

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
  context: HouseholdAccessContext = getDemoHouseholdAccessContext(),
): Promise<ModuleReadModel> {
  const { adapter, household, members } = await getBaseReadModel(context);
  const [comments, activity] = await Promise.all([adapter.listComments(context), adapter.listActivity(context)]);

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
