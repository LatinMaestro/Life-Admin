import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { getPrismaClient } from "@/lib/server/prisma";

export type InboxRoutingInput =
  | { destination: "task"; date: Date }
  | { destination: "reminder"; date: Date }
  | {
      destination: "bill_or_renewal";
      date: Date;
      reminderType: "bill" | "renewal";
      provider: string | null;
    }
  | { destination: "shopping_list"; shoppingListId: string }
  | {
      destination: "source_reference";
      label: string;
      url: string | null;
    };

export async function routeMobileInboxItem(
  context: HouseholdAccessContext,
  inboxItemId: string,
  input: InboxRoutingInput,
) {
  const prisma = getPrismaClient();

  await prisma.$transaction(async (tx) => {
    const [actor, inboxItem] = await Promise.all([
      tx.householdMember.findFirst({
        where: {
          id: context.memberId,
          userId: context.userId,
          householdId: context.householdId,
          status: "active",
        },
        select: { id: true },
      }),
      tx.inboxItem.findFirst({
        where: {
          id: inboxItemId,
          householdId: context.householdId,
          status: { not: "archived" },
        },
        select: {
          id: true,
          title: true,
          description: true,
          assignedMemberId: true,
          sourceReferenceId: true,
        },
      }),
    ]);

    if (!actor || !inboxItem) {
      throw new Error("The inbox item is not available.");
    }

    const requestedAssigneeId = inboxItem.assignedMemberId ?? context.memberId;
    const assignee = await tx.householdMember.findFirst({
      where: {
        id: requestedAssigneeId,
        householdId: context.householdId,
        status: "active",
      },
      select: { id: true },
    });
    const assignedMemberId = assignee?.id ?? context.memberId;
    let destinationId: string;

    switch (input.destination) {
      case "task": {
        const task = await tx.task.create({
          data: {
            householdId: context.householdId,
            title: inboxItem.title,
            notes: inboxItem.description,
            dueAt: input.date,
            assignedMemberId,
            createdByMemberId: context.memberId,
            sourceReferenceId: inboxItem.sourceReferenceId,
          },
          select: { id: true },
        });
        destinationId = task.id;
        break;
      }
      case "reminder": {
        const reminder = await tx.reminder.create({
          data: {
            householdId: context.householdId,
            title: inboxItem.title,
            notes: inboxItem.description,
            remindAt: input.date,
            assignedMemberId,
            createdByMemberId: context.memberId,
          },
          select: { id: true },
        });
        destinationId = reminder.id;
        break;
      }
      case "bill_or_renewal": {
        const reminder = await tx.billOrRenewal.create({
          data: {
            householdId: context.householdId,
            title: inboxItem.title,
            provider: input.provider,
            type: input.reminderType,
            dueAt: input.reminderType === "bill" ? input.date : null,
            renewalAt: input.reminderType === "renewal" ? input.date : null,
            notes: inboxItem.description,
            assignedMemberId,
            createdByMemberId: context.memberId,
            sourceReferenceId: inboxItem.sourceReferenceId,
          },
          select: { id: true },
        });
        destinationId = reminder.id;
        break;
      }
      case "shopping_list": {
        const list = await tx.shoppingList.findFirst({
          where: {
            id: input.shoppingListId,
            householdId: context.householdId,
            status: "active",
          },
          select: { id: true },
        });
        if (!list) throw new Error("Choose an active shopping list.");
        const item = await tx.shoppingListItem.create({
          data: {
            householdId: context.householdId,
            shoppingListId: list.id,
            label: inboxItem.title,
            notes: inboxItem.description,
            assignedMemberId,
            createdByMemberId: context.memberId,
          },
          select: { id: true },
        });
        destinationId = item.id;
        break;
      }
      case "source_reference": {
        if (inboxItem.sourceReferenceId) {
          destinationId = inboxItem.sourceReferenceId;
        } else {
          const source = await tx.sourceReference.create({
            data: {
              householdId: context.householdId,
              title: inboxItem.title,
              label: input.label,
              url: input.url,
              kind: input.url ? "source_link" : "source_document_reference",
              createdByMemberId: context.memberId,
            },
            select: { id: true },
          });
          destinationId = source.id;
          await tx.inboxItem.update({
            where: { id: inboxItem.id },
            data: { sourceReferenceId: source.id },
          });
        }
        break;
      }
    }

    await tx.inboxItem.update({
      where: { id: inboxItem.id },
      data: {
        status: "linked",
        suggestedDestination: input.destination,
        routingReason: "Routed manually by a household member.",
      },
    });

    await tx.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType: "inbox_item",
        entityId: inboxItem.id,
        eventType: "changed_status",
        summary: `Sorted inbox item into ${input.destination.replaceAll("_", " ")}: ${inboxItem.title}`,
        metadata: {
          destinationType: input.destination,
          destinationId,
        },
      },
    });
  });
}
