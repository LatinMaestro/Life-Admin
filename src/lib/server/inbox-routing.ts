import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { requireHouseholdPermission } from "@/lib/access-control";
import { getPrismaClient } from "@/lib/server/prisma";

export type InboxRouteDestination =
  | "task"
  | "reminder"
  | "shopping_item"
  | "bill"
  | "renewal";

export type RouteInboxItemInput = {
  inboxItemId: string;
  destination: InboxRouteDestination;
  date?: Date | null;
  shoppingListId?: string | null;
};

export class InboxRoutingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InboxRoutingError";
  }
}

export async function routeInboxItem(
  context: HouseholdAccessContext,
  input: RouteInboxItemInput,
) {
  requireHouseholdPermission(context, "manage_shared_items");
  const prisma = getPrismaClient();

  return prisma.$transaction(async (tx) => {
    const [member, inboxItem] = await Promise.all([
      tx.householdMember.findFirst({
        where: {
          id: context.memberId,
          householdId: context.householdId,
          userId: context.userId,
          status: "active",
        },
        select: { id: true },
      }),
      tx.inboxItem.findFirst({
        where: {
          id: input.inboxItemId,
          householdId: context.householdId,
          status: { in: ["new", "needs_review"] },
        },
        select: {
          id: true,
          title: true,
          description: true,
          priority: true,
          sourceReferenceId: true,
        },
      }),
    ]);

    if (!member || !inboxItem) {
      throw new InboxRoutingError("Choose an open inbox item.");
    }

    let entityType:
      | "task"
      | "reminder"
      | "shopping_list_item"
      | "bill_or_renewal";
    let entityId: string;
    let destinationLabel: string;
    let suggestedDestination:
      | "task"
      | "reminder"
      | "shopping_list"
      | "bill_or_renewal";

    if (input.destination === "task") {
      const task = await tx.task.create({
        data: {
          householdId: context.householdId,
          title: inboxItem.title,
          notes: inboxItem.description,
          priority: inboxItem.priority,
          stage: "action",
          assignedMemberId: context.memberId,
          createdByMemberId: context.memberId,
          sourceReferenceId: inboxItem.sourceReferenceId,
        },
        select: { id: true },
      });
      entityType = "task";
      entityId = task.id;
      destinationLabel = "Tasks";
      suggestedDestination = "task";
    } else if (input.destination === "reminder") {
      if (!input.date) throw new InboxRoutingError("Choose a reminder date.");
      const reminder = await tx.reminder.create({
        data: {
          householdId: context.householdId,
          title: inboxItem.title,
          notes: inboxItem.description,
          remindAt: input.date,
          cadence: "once",
          assignedMemberId: context.memberId,
          createdByMemberId: context.memberId,
        },
        select: { id: true },
      });
      entityType = "reminder";
      entityId = reminder.id;
      destinationLabel = "Reminders";
      suggestedDestination = "reminder";
    } else if (input.destination === "shopping_item") {
      if (!input.shoppingListId) throw new InboxRoutingError("Choose a shopping list.");
      const list = await tx.shoppingList.findFirst({
        where: {
          id: input.shoppingListId,
          householdId: context.householdId,
          status: "active",
        },
        select: { id: true },
      });
      if (!list) throw new InboxRoutingError("Choose an active shopping list.");
      const shoppingItem = await tx.shoppingListItem.create({
        data: {
          householdId: context.householdId,
          shoppingListId: list.id,
          label: inboxItem.title,
          notes: inboxItem.description,
          assignedMemberId: context.memberId,
          createdByMemberId: context.memberId,
        },
        select: { id: true },
      });
      entityType = "shopping_list_item";
      entityId = shoppingItem.id;
      destinationLabel = "Shopping";
      suggestedDestination = "shopping_list";
    } else {
      if (!input.date) {
        throw new InboxRoutingError(
          input.destination === "bill" ? "Choose a due date." : "Choose a renewal date.",
        );
      }
      const billOrRenewal = await tx.billOrRenewal.create({
        data: {
          householdId: context.householdId,
          title: inboxItem.title,
          type: input.destination,
          dueAt: input.destination === "bill" ? input.date : null,
          renewalAt: input.destination === "renewal" ? input.date : null,
          notes: inboxItem.description,
          assignedMemberId: context.memberId,
          createdByMemberId: context.memberId,
          sourceReferenceId: inboxItem.sourceReferenceId,
        },
        select: { id: true },
      });
      entityType = "bill_or_renewal";
      entityId = billOrRenewal.id;
      destinationLabel = input.destination === "bill" ? "Bills" : "Renewals";
      suggestedDestination = "bill_or_renewal";
    }

    await tx.inboxItem.update({
      where: { id: inboxItem.id },
      data: {
        status: "linked",
        suggestedDestination,
        routingReason: `Manually sorted into ${destinationLabel}.`,
      },
    });

    await tx.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType,
        entityId,
        eventType: "created",
        summary: `Sorted inbox item into ${destinationLabel}: ${inboxItem.title}`,
        metadata: { inboxItemId: inboxItem.id },
      },
    });

    return { entityType, entityId };
  });
}
