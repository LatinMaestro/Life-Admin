import "server-only";

import { createHouseholdScopedWhere, requireHouseholdPermission } from "@/lib/access-control";
import type { HouseholdAccessContext } from "@/lib/access-control";
import type {
  ActivityEventSummary,
  BillOrRenewalSummary,
  CommentSummary,
  HouseholdMemberSummary,
  HouseholdPersistenceAdapter,
  HouseholdSummary,
  InboxItemSummary,
  ReminderSummary,
  ShoppingListSummary,
  SourceReferenceSummary,
  TaskSummary,
} from "@/lib/persistence/contracts";
import { getPrismaClient } from "@/lib/server/prisma";

function requireReadableHousehold(context: HouseholdAccessContext) {
  requireHouseholdPermission(context, "view_household");

  return createHouseholdScopedWhere(context);
}

export const prismaHouseholdPersistenceAdapter: HouseholdPersistenceAdapter = {
  async getHousehold(context): Promise<HouseholdSummary> {
    requireHouseholdPermission(context, "view_household");

    const household = await getPrismaClient().household.findFirstOrThrow({
      where: {
        id: context.householdId,
        members: {
          some: {
            id: context.memberId,
            userId: context.userId,
            status: "active",
          },
        },
      },
      select: {
        id: true,
        name: true,
        timezone: true,
      },
    });

    return {
      ...household,
      householdId: household.id,
    };
  },

  async listMembers(context): Promise<HouseholdMemberSummary[]> {
    const where = requireReadableHousehold(context);

    const members = await getPrismaClient().householdMember.findMany({
      where,
      orderBy: [{ role: "asc" }, { displayName: "asc" }],
      select: {
        id: true,
        householdId: true,
        displayName: true,
        role: true,
        status: true,
        initials: true,
      },
    });

    return members;
  },

  async listInboxItems(context): Promise<InboxItemSummary[]> {
    const where = requireReadableHousehold(context);

    return getPrismaClient().inboxItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        householdId: true,
        title: true,
        description: true,
        status: true,
        category: true,
        priority: true,
        assignedMemberId: true,
        createdByMemberId: true,
        sourceReferenceId: true,
      },
    });
  },

  async listTasks(context): Promise<TaskSummary[]> {
    const where = requireReadableHousehold(context);

    return getPrismaClient().task.findMany({
      where,
      orderBy: [{ dueAt: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        householdId: true,
        title: true,
        notes: true,
        status: true,
        stage: true,
        priority: true,
        dueAt: true,
        assignedMemberId: true,
        createdByMemberId: true,
        sourceReferenceId: true,
      },
    });
  },

  async listReminders(context): Promise<ReminderSummary[]> {
    const where = requireReadableHousehold(context);

    return getPrismaClient().reminder.findMany({
      where,
      orderBy: [{ remindAt: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        householdId: true,
        title: true,
        notes: true,
        status: true,
        cadence: true,
        remindAt: true,
        assignedMemberId: true,
        createdByMemberId: true,
      },
    });
  },

  async listShoppingLists(context): Promise<ShoppingListSummary[]> {
    const where = requireReadableHousehold(context);

    const lists = await getPrismaClient().shoppingList.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        householdId: true,
        name: true,
        status: true,
        createdByMemberId: true,
        items: {
          select: {
            checked: true,
          },
        },
      },
    });

    return lists.map((list) => ({
      id: list.id,
      householdId: list.householdId,
      name: list.name,
      status: list.status,
      createdByMemberId: list.createdByMemberId,
      openItemCount: list.items.filter((item) => !item.checked).length,
      totalItemCount: list.items.length,
    }));
  },

  async listBillsAndRenewals(context): Promise<BillOrRenewalSummary[]> {
    const where = requireReadableHousehold(context);

    return getPrismaClient().billOrRenewal.findMany({
      where,
      orderBy: [{ dueAt: "asc" }, { renewalAt: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        householdId: true,
        title: true,
        provider: true,
        type: true,
        status: true,
        dueAt: true,
        renewalAt: true,
        assignedMemberId: true,
        createdByMemberId: true,
        sourceReferenceId: true,
      },
    });
  },

  async listSourceReferences(context): Promise<SourceReferenceSummary[]> {
    const where = requireReadableHousehold(context);
    requireHouseholdPermission(context, "view_source_references");

    return getPrismaClient().sourceReference.findMany({
      where,
      orderBy: [{ reviewStatus: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        householdId: true,
        title: true,
        kind: true,
        label: true,
        reviewStatus: true,
        sensitivity: true,
        createdByMemberId: true,
      },
    });
  },

  async listComments(context): Promise<CommentSummary[]> {
    const where = requireReadableHousehold(context);

    return getPrismaClient().comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        householdId: true,
        entityType: true,
        entityId: true,
        body: true,
        createdByMemberId: true,
        createdAt: true,
      },
    });
  },

  async listActivity(context): Promise<ActivityEventSummary[]> {
    const where = requireReadableHousehold(context);

    return getPrismaClient().activityEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        householdId: true,
        entityType: true,
        entityId: true,
        eventType: true,
        summary: true,
        actorMemberId: true,
        createdAt: true,
      },
    });
  },
};
