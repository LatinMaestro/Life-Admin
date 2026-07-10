import "server-only";

import { getCurrentMember } from "@/lib/household";
import type { HouseholdRole } from "@/lib/household";
import type { HouseholdAccessContext } from "@/lib/access-control";
import { getDemoHouseholdAccessContext } from "@/lib/server/demo-access-context";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";

type DashboardQueue = {
  label: string;
  count: number;
  href: string;
};

type DashboardWorkItem = {
  id: string;
  title: string;
  status: string;
  href: string;
};

type DashboardReadModel = {
  household: {
    id: string;
    name: string;
    timezone: string;
  };
  currentMember: {
    id: string;
    displayName: string;
    role: HouseholdRole;
  };
  counts: {
    inboxItems: number;
    openTasks: number;
    scheduledReminders: number;
    openShoppingItems: number;
    billsAndRenewals: number;
    sourceReferences: number;
    comments: number;
    activityEvents: number;
  };
  reviewQueues: DashboardQueue[];
  assignedToCurrentMember: DashboardWorkItem[];
};

function isOpenStatus(status: string) {
  return !["done", "archived", "linked"].includes(status);
}

function isReviewStatus(status: string) {
  return status === "needs_review";
}

export async function getDashboardReadModel(
  context: HouseholdAccessContext = getDemoHouseholdAccessContext(),
): Promise<DashboardReadModel> {
  const adapter = await getHouseholdPersistenceAdapter();
  const currentMember = getCurrentMember();

  const [household, inboxItems, tasks, reminders, shoppingLists, billsAndRenewals, sourceReferences, comments, activity] =
    await Promise.all([
      adapter.getHousehold(context),
      adapter.listInboxItems(context),
      adapter.listTasks(context),
      adapter.listReminders(context),
      adapter.listShoppingLists(context),
      adapter.listBillsAndRenewals(context),
      adapter.listSourceReferences(context),
      adapter.listComments(context),
      adapter.listActivity(context),
    ]);

  const openInboxItems = inboxItems.filter((item) => isOpenStatus(item.status));
  const openTasks = tasks.filter((task) => isOpenStatus(task.status));
  const scheduledReminders = reminders.filter((reminder) => reminder.status === "scheduled");
  const reviewBillsAndRenewals = billsAndRenewals.filter((item) => isReviewStatus(item.status));
  const reviewSources = sourceReferences.filter((source) => isReviewStatus(source.reviewStatus));

  const assignedToCurrentMember: DashboardWorkItem[] = [
    ...openTasks
      .filter((task) => task.assignedMemberId === currentMember.id)
      .map((task) => ({ id: task.id, title: task.title, status: task.status, href: "/tasks" })),
    ...scheduledReminders
      .filter((reminder) => reminder.assignedMemberId === currentMember.id)
      .map((reminder) => ({ id: reminder.id, title: reminder.title, status: reminder.status, href: "/tasks" })),
    ...billsAndRenewals
      .filter((bill) => bill.assignedMemberId === currentMember.id)
      .map((bill) => ({ id: bill.id, title: bill.title, status: bill.status, href: "/bills" })),
  ];

  return {
    household: {
      id: household.id,
      name: household.name,
      timezone: household.timezone,
    },
    currentMember: {
      id: currentMember.id,
      displayName: currentMember.displayName,
      role: currentMember.role,
    },
    counts: {
      inboxItems: inboxItems.length,
      openTasks: openTasks.length,
      scheduledReminders: scheduledReminders.length,
      openShoppingItems: shoppingLists.reduce((total, list) => total + list.openItemCount, 0),
      billsAndRenewals: billsAndRenewals.length,
      sourceReferences: sourceReferences.length,
      comments: comments.length,
      activityEvents: activity.length,
    },
    reviewQueues: [
      { label: "Inbox", count: openInboxItems.length, href: "/inbox" },
      { label: "Bills and renewals", count: reviewBillsAndRenewals.length, href: "/bills" },
      { label: "Source references", count: reviewSources.length, href: "/sources" },
    ],
    assignedToCurrentMember,
  };
}
