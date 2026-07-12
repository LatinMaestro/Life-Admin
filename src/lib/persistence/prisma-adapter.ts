import "server-only";

import { createHouseholdScopedWhere, requireHouseholdPermission } from "@/lib/access-control";
import type { HouseholdAccessContext } from "@/lib/access-control";
import type {
  ActivityEventSummary,
  CreateBillOrRenewalInput,
  CreateInboxItemInput,
  CreateReminderInput,
  CreateShoppingListInput,
  CreateShoppingListItemInput,
  CreateSourceReferenceInput,
  CreateTaskInput,
  BillOrRenewalSummary,
  CommentSummary,
  HouseholdMemberSummary,
  HouseholdPersistenceAdapter,
  HouseholdSummary,
  InboxItemSummary,
  ReminderSummary,
  ShoppingListItemSummary,
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

  async createInboxItem(
    context,
    input: CreateInboxItemInput,
  ): Promise<InboxItemSummary> {
    requireHouseholdPermission(context, "manage_shared_items");
    const prisma = getPrismaClient();

    return prisma.$transaction(async (transaction) => {
      const member = await transaction.householdMember.findFirst({
        where: {
          id: context.memberId,
          householdId: context.householdId,
          userId: context.userId,
          status: "active",
        },
        select: { id: true },
      });

      if (!member) {
        throw new Error("Active household membership is required to create an inbox item.");
      }

      const item = await transaction.inboxItem.create({
        data: {
          householdId: context.householdId,
          title: input.title,
          description: input.description,
          category: input.category,
          priority: input.priority,
          suggestedDestination: input.suggestedDestination,
          createdByMemberId: context.memberId,
        },
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

      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "inbox_item",
          entityId: item.id,
          eventType: "created",
          summary: `Created inbox item: ${item.title}`,
        },
      });

      return item;
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

  async createTask(context, input: CreateTaskInput): Promise<TaskSummary> {
    requireHouseholdPermission(context, "manage_shared_items");
    const prisma = getPrismaClient();

    return prisma.$transaction(async (transaction) => {
      const member = await transaction.householdMember.findFirst({
        where: {
          id: context.memberId,
          householdId: context.householdId,
          userId: context.userId,
          status: "active",
        },
        select: { id: true },
      });

      if (!member) {
        throw new Error("Active household membership is required to create a task.");
      }

      const task = await transaction.task.create({
        data: {
          householdId: context.householdId,
          title: input.title,
          notes: input.notes,
          priority: input.priority,
          dueAt: input.dueAt,
          createdByMemberId: context.memberId,
          assignedMemberId: context.memberId,
        },
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

      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "task",
          entityId: task.id,
          eventType: "created",
          summary: `Created task: ${task.title}`,
        },
      });

      return task;
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

  async createReminder(
    context,
    input: CreateReminderInput,
  ): Promise<ReminderSummary> {
    requireHouseholdPermission(context, "manage_shared_items");
    const prisma = getPrismaClient();

    return prisma.$transaction(async (transaction) => {
      const member = await transaction.householdMember.findFirst({
        where: {
          id: context.memberId,
          householdId: context.householdId,
          userId: context.userId,
          status: "active",
        },
        select: { id: true },
      });

      if (!member) {
        throw new Error("Active household membership is required to create a reminder.");
      }

      const reminder = await transaction.reminder.create({
        data: {
          householdId: context.householdId,
          title: input.title,
          notes: input.notes,
          cadence: input.cadence,
          remindAt: input.remindAt,
          createdByMemberId: context.memberId,
          assignedMemberId: context.memberId,
        },
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

      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "reminder",
          entityId: reminder.id,
          eventType: "created",
          summary: `Created reminder: ${reminder.title}`,
        },
      });

      return reminder;
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

  async listShoppingListItems(context): Promise<ShoppingListItemSummary[]> {
    const where = requireReadableHousehold(context);

    return getPrismaClient().shoppingListItem.findMany({
      where,
      orderBy: [{ checked: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        householdId: true,
        shoppingListId: true,
        label: true,
        notes: true,
        quantity: true,
        category: true,
        checked: true,
        assignedMemberId: true,
        createdByMemberId: true,
      },
    });
  },

  async createShoppingList(
    context,
    input: CreateShoppingListInput,
  ): Promise<ShoppingListSummary> {
    requireHouseholdPermission(context, "manage_shared_items");
    const prisma = getPrismaClient();

    return prisma.$transaction(async (transaction) => {
      const member = await transaction.householdMember.findFirst({
        where: {
          id: context.memberId,
          householdId: context.householdId,
          userId: context.userId,
          status: "active",
        },
        select: { id: true },
      });

      if (!member) {
        throw new Error("Active household membership is required to create a shopping list.");
      }

      const list = await transaction.shoppingList.create({
        data: {
          householdId: context.householdId,
          name: input.name,
          createdByMemberId: context.memberId,
        },
        select: {
          id: true,
          householdId: true,
          name: true,
          status: true,
          createdByMemberId: true,
        },
      });

      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "shopping_list",
          entityId: list.id,
          eventType: "created",
          summary: `Created shopping list: ${list.name}`,
        },
      });

      return { ...list, openItemCount: 0, totalItemCount: 0 };
    });
  },

  async createShoppingListItem(
    context,
    input: CreateShoppingListItemInput,
  ): Promise<ShoppingListItemSummary> {
    requireHouseholdPermission(context, "manage_shared_items");
    const prisma = getPrismaClient();

    return prisma.$transaction(async (transaction) => {
      const [member, list] = await Promise.all([
        transaction.householdMember.findFirst({
          where: {
            id: context.memberId,
            householdId: context.householdId,
            userId: context.userId,
            status: "active",
          },
          select: { id: true },
        }),
        transaction.shoppingList.findFirst({
          where: {
            id: input.shoppingListId,
            householdId: context.householdId,
            status: "active",
          },
          select: { id: true },
        }),
      ]);

      if (!member || !list) {
        throw new Error("An active household member and shopping list are required.");
      }

      const item = await transaction.shoppingListItem.create({
        data: {
          householdId: context.householdId,
          shoppingListId: list.id,
          label: input.label,
          notes: input.notes,
          quantity: input.quantity,
          category: input.category,
          assignedMemberId: context.memberId,
          createdByMemberId: context.memberId,
        },
        select: {
          id: true,
          householdId: true,
          shoppingListId: true,
          label: true,
          notes: true,
          quantity: true,
          category: true,
          checked: true,
          assignedMemberId: true,
          createdByMemberId: true,
        },
      });

      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "shopping_list_item",
          entityId: item.id,
          eventType: "created",
          summary: `Added shopping item: ${item.label}`,
        },
      });

      return item;
    });
  },

  async setShoppingListItemChecked(
    context,
    itemId,
    checked,
  ): Promise<ShoppingListItemSummary> {
    requireHouseholdPermission(context, "manage_shared_items");
    const prisma = getPrismaClient();

    return prisma.$transaction(async (transaction) => {
      const [member, existingItem] = await Promise.all([
        transaction.householdMember.findFirst({
          where: {
            id: context.memberId,
            householdId: context.householdId,
            userId: context.userId,
            status: "active",
          },
          select: { id: true },
        }),
        transaction.shoppingListItem.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true },
        }),
      ]);

      if (!member || !existingItem) {
        throw new Error("The shopping item is not available to this household member.");
      }

      const item = await transaction.shoppingListItem.update({
        where: { id: existingItem.id },
        data: {
          checked,
          checkedAt: checked ? new Date() : null,
          checkedByMemberId: checked ? context.memberId : null,
        },
        select: {
          id: true,
          householdId: true,
          shoppingListId: true,
          label: true,
          notes: true,
          quantity: true,
          category: true,
          checked: true,
          assignedMemberId: true,
          createdByMemberId: true,
        },
      });

      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "shopping_list_item",
          entityId: item.id,
          eventType: checked ? "completed" : "reopened",
          summary: `${checked ? "Checked" : "Reopened"} shopping item: ${item.label}`,
        },
      });

      return item;
    });
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

  async createBillOrRenewal(
    context,
    input: CreateBillOrRenewalInput,
  ): Promise<BillOrRenewalSummary> {
    requireHouseholdPermission(context, "manage_shared_items");
    const prisma = getPrismaClient();

    return prisma.$transaction(async (transaction) => {
      const [member, source] = await Promise.all([
        transaction.householdMember.findFirst({
          where: {
            id: context.memberId,
            householdId: context.householdId,
            userId: context.userId,
            status: "active",
          },
          select: { id: true },
        }),
        input.sourceReferenceId
          ? transaction.sourceReference.findFirst({
              where: {
                id: input.sourceReferenceId,
                householdId: context.householdId,
              },
              select: { id: true },
            })
          : Promise.resolve(null),
      ]);

      if (!member || (input.sourceReferenceId && !source)) {
        throw new Error("An active household member and valid source reference are required.");
      }

      const item = await transaction.billOrRenewal.create({
        data: {
          householdId: context.householdId,
          title: input.title,
          provider: input.provider,
          type: input.type,
          dueAt: input.type === "bill" ? input.dueAt : null,
          renewalAt: input.type === "renewal" ? input.renewalAt : null,
          notes: input.notes,
          sourceReferenceId: source?.id,
          assignedMemberId: context.memberId,
          createdByMemberId: context.memberId,
        },
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

      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "bill_or_renewal",
          entityId: item.id,
          eventType: "created",
          summary: `Created ${item.type} reminder: ${item.title}`,
        },
      });

      return item;
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

  async createSourceReference(
    context,
    input: CreateSourceReferenceInput,
  ): Promise<SourceReferenceSummary> {
    requireHouseholdPermission(context, "manage_shared_items");
    requireHouseholdPermission(context, "view_source_references");
    const prisma = getPrismaClient();

    return prisma.$transaction(async (transaction) => {
      const member = await transaction.householdMember.findFirst({
        where: {
          id: context.memberId,
          householdId: context.householdId,
          userId: context.userId,
          status: "active",
        },
        select: { id: true },
      });

      if (!member) {
        throw new Error("Active household membership is required to create a source reference.");
      }

      const source = await transaction.sourceReference.create({
        data: {
          householdId: context.householdId,
          title: input.title,
          kind: input.kind,
          label: input.label,
          url: input.url,
          createdByMemberId: context.memberId,
        },
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

      await transaction.activityEvent.create({
        data: {
          householdId: context.householdId,
          actorUserId: context.userId,
          actorMemberId: context.memberId,
          entityType: "source_reference",
          entityId: source.id,
          eventType: "created",
          summary: `Created source reference: ${source.title}`,
        },
      });

      return source;
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
