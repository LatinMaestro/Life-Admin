import "server-only";

import {
  canManageHouseholdMembers,
  canManageHouseholdSettings,
  hasHouseholdPermission,
} from "@/lib/access-control";
import type { HouseholdAccessContext } from "@/lib/access-control";
import type { MobileBootstrapResponse } from "@/lib/api/v1/contracts";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";

const closedStatuses = new Set(["done", "archived", "linked"]);

export async function getMobileBootstrap(
  context: HouseholdAccessContext,
): Promise<MobileBootstrapResponse> {
  const adapter = await getHouseholdPersistenceAdapter();
  const [
    household,
    members,
    inboxItems,
    tasks,
    reminders,
    shoppingLists,
    shoppingItems,
    billsAndRenewals,
    sourceReferences,
  ] = await Promise.all([
    adapter.getHousehold(context),
    adapter.listMembers(context),
    adapter.listInboxItems(context),
    adapter.listTasks(context),
    adapter.listReminders(context),
    adapter.listShoppingLists(context),
    adapter.listShoppingListItems(context),
    adapter.listBillsAndRenewals(context),
    adapter.listSourceReferences(context),
  ]);

  const activeMembers = members.filter((member) => member.status === "active");
  const currentMember = activeMembers.find((member) => member.id === context.memberId);

  if (!currentMember) {
    throw new Error("The active household member is not available.");
  }

  const activeListIds = new Set(
    shoppingLists
      .filter((list) => list.status === "active")
      .map((list) => list.id),
  );

  return {
    apiVersion: "1",
    generatedAt: new Date().toISOString(),
    household: {
      id: household.id,
      name: household.name,
      timezone: household.timezone,
    },
    currentMember: {
      id: currentMember.id,
      displayName: currentMember.displayName,
      initials: currentMember.initials ?? getInitials(currentMember.displayName),
      role: currentMember.role,
    },
    members: activeMembers.map((member) => ({
      id: member.id,
      displayName: member.displayName,
      initials: member.initials ?? getInitials(member.displayName),
      role: member.role,
    })),
    counts: {
      inbox: inboxItems.filter((item) => !closedStatuses.has(item.status)).length,
      tasks: tasks.filter((task) => !closedStatuses.has(task.status)).length,
      reminders: reminders.filter((reminder) => reminder.status === "scheduled").length,
      shoppingItems: shoppingItems.filter(
        (item) => activeListIds.has(item.shoppingListId) && !item.checked,
      ).length,
      billsAndRenewals: billsAndRenewals.filter(
        (item) => !closedStatuses.has(item.status),
      ).length,
      sourceReferencesNeedingReview: sourceReferences.filter(
        (source) => source.reviewStatus === "needs_review",
      ).length,
    },
    capabilities: {
      canManageHousehold: canManageHouseholdSettings(context),
      canManageMembers: canManageHouseholdMembers(context),
      canManageSharedItems: hasHouseholdPermission(context, "manage_shared_items"),
      canViewSourceReferences: hasHouseholdPermission(
        context,
        "view_source_references",
      ),
    },
  };
}

function getInitials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
