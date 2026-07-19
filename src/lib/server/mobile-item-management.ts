import "server-only";

import type { Prisma } from "@prisma/client";
import type { HouseholdAccessContext } from "@/lib/access-control";
import type { MobileItemEntityType } from "@/lib/api/v1/contracts";
import { getPrismaClient } from "@/lib/server/prisma";

export type MobileItemUpdate = {
  title: string;
  description?: string | null;
  date?: Date | null;
  assignedMemberId?: string | null;
  sourceReferenceId?: string | null;
  category?: "school" | "appointment" | "renewal" | "household_admin" | "shopping" | "other";
  priority?: "low" | "normal" | "high";
  destination?: "task" | "reminder" | "bill_or_renewal" | "shopping_list" | "source_reference" | "none";
  provider?: string | null;
  label?: string;
  url?: string | null;
};

export async function updateMobileItem(
  context: HouseholdAccessContext,
  entityType: MobileItemEntityType,
  itemId: string,
  input: MobileItemUpdate,
) {
  const prisma = getPrismaClient();

  await prisma.$transaction(async (tx) => {
    await requireActor(tx, context);
    const assignedMemberId = await resolveMember(
      tx,
      context.householdId,
      input.assignedMemberId,
    );
    const sourceReferenceId = await resolveSource(
      tx,
      context.householdId,
      input.sourceReferenceId,
    );

    switch (entityType) {
      case "inbox_item": {
        const item = await tx.inboxItem.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true },
        });
        if (!item) throw new Error("The inbox item is not available.");
        await tx.inboxItem.update({
          where: { id: item.id },
          data: {
            title: input.title,
            description: input.description,
            category: input.category,
            priority: input.priority,
            suggestedDestination: input.destination,
            assignedMemberId,
            sourceReferenceId,
          },
        });
        break;
      }
      case "task": {
        const item = await tx.task.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true },
        });
        if (!item) throw new Error("The task is not available.");
        await tx.task.update({
          where: { id: item.id },
          data: {
            title: input.title,
            notes: input.description,
            dueAt: input.date,
            priority: input.priority,
            assignedMemberId,
            sourceReferenceId,
          },
        });
        break;
      }
      case "reminder": {
        const item = await tx.reminder.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true },
        });
        if (!item) throw new Error("The reminder is not available.");
        await tx.reminder.update({
          where: { id: item.id },
          data: {
            title: input.title,
            notes: input.description,
            remindAt: input.date,
            assignedMemberId,
          },
        });
        break;
      }
      case "shopping_list": {
        const item = await tx.shoppingList.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true },
        });
        if (!item) throw new Error("The shopping list is not available.");
        await tx.shoppingList.update({
          where: { id: item.id },
          data: { name: input.title },
        });
        break;
      }
      case "bill_or_renewal": {
        const item = await tx.billOrRenewal.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true, type: true },
        });
        if (!item) throw new Error("The bill or renewal is not available.");
        await tx.billOrRenewal.update({
          where: { id: item.id },
          data: {
            title: input.title,
            provider: input.provider,
            dueAt: item.type === "bill" ? input.date : null,
            renewalAt: item.type === "renewal" ? input.date : null,
            assignedMemberId,
            sourceReferenceId,
          },
        });
        break;
      }
      case "source_reference": {
        const item = await tx.sourceReference.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true },
        });
        if (!item) throw new Error("The source reference is not available.");
        await tx.sourceReference.update({
          where: { id: item.id },
          data: {
            title: input.title,
            label: input.label,
            url: input.url,
          },
        });
        break;
      }
    }

    await tx.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType,
        entityId: itemId,
        eventType: "updated",
        summary: `Updated ${entityLabel(entityType)}: ${input.title}`,
      },
    });
  });
}

export async function archiveMobileItem(
  context: HouseholdAccessContext,
  entityType: MobileItemEntityType,
  itemId: string,
) {
  const prisma = getPrismaClient();

  await prisma.$transaction(async (tx) => {
    await requireActor(tx, context);
    let title: string;

    switch (entityType) {
      case "inbox_item": {
        const item = await tx.inboxItem.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true, title: true },
        });
        if (!item) throw new Error("The inbox item is not available.");
        title = item.title;
        await tx.inboxItem.update({ where: { id: item.id }, data: { status: "archived" } });
        break;
      }
      case "task": {
        const item = await tx.task.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true, title: true },
        });
        if (!item) throw new Error("The task is not available.");
        title = item.title;
        await tx.task.update({ where: { id: item.id }, data: { status: "archived" } });
        break;
      }
      case "reminder": {
        const item = await tx.reminder.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true, title: true },
        });
        if (!item) throw new Error("The reminder is not available.");
        title = item.title;
        await tx.reminder.update({ where: { id: item.id }, data: { status: "archived" } });
        break;
      }
      case "shopping_list": {
        const item = await tx.shoppingList.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true, name: true },
        });
        if (!item) throw new Error("The shopping list is not available.");
        title = item.name;
        await tx.shoppingList.update({ where: { id: item.id }, data: { status: "archived" } });
        break;
      }
      case "bill_or_renewal": {
        const item = await tx.billOrRenewal.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true, title: true },
        });
        if (!item) throw new Error("The bill or renewal is not available.");
        title = item.title;
        await tx.billOrRenewal.update({ where: { id: item.id }, data: { status: "archived" } });
        break;
      }
      case "source_reference": {
        const item = await tx.sourceReference.findFirst({
          where: { id: itemId, householdId: context.householdId },
          select: { id: true, title: true },
        });
        if (!item) throw new Error("The source reference is not available.");
        title = item.title;
        await tx.sourceReference.update({ where: { id: item.id }, data: { reviewStatus: "archived" } });
        break;
      }
    }

    await tx.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType,
        entityId: itemId,
        eventType: "archived",
        summary: `Archived ${entityLabel(entityType)}: ${title}`,
      },
    });
  });
}

type TransactionClient = Prisma.TransactionClient;

async function requireActor(
  tx: TransactionClient,
  context: HouseholdAccessContext,
) {
  const actor = await tx.householdMember.findFirst({
    where: {
      id: context.memberId,
      userId: context.userId,
      householdId: context.householdId,
      status: "active",
    },
    select: { id: true },
  });
  if (!actor) throw new Error("Active household membership is required.");
}

async function resolveMember(
  tx: TransactionClient,
  householdId: string,
  memberId: string | null | undefined,
) {
  if (memberId === undefined) return undefined;
  if (memberId === null) return null;
  const member = await tx.householdMember.findFirst({
    where: { id: memberId, householdId, status: "active" },
    select: { id: true },
  });
  if (!member) throw new Error("Choose an active household member.");
  return member.id;
}

async function resolveSource(
  tx: TransactionClient,
  householdId: string,
  sourceId: string | null | undefined,
) {
  if (sourceId === undefined) return undefined;
  if (sourceId === null) return null;
  const source = await tx.sourceReference.findFirst({
    where: { id: sourceId, householdId, reviewStatus: { not: "archived" } },
    select: { id: true },
  });
  if (!source) throw new Error("Choose a source from this household.");
  return source.id;
}

function entityLabel(entityType: MobileItemEntityType) {
  return entityType.replaceAll("_", " ");
}
