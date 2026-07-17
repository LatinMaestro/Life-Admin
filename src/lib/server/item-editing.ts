import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import { requireHouseholdPermission } from "@/lib/access-control";
import { getPrismaClient } from "@/lib/server/prisma";

export type EditableItemType =
  | "inbox_item"
  | "task"
  | "reminder"
  | "bill_or_renewal";

type EditableItemBase = {
  id: string;
  type: EditableItemType;
  title: string;
  notes: string | null;
  assignedMemberId: string | null;
};

export type EditableItem =
  | (EditableItemBase & { type: "inbox_item" })
  | (EditableItemBase & {
      type: "task";
      date: Date | null;
    })
  | (EditableItemBase & {
      type: "reminder";
      date: Date | null;
    })
  | (EditableItemBase & {
      type: "bill_or_renewal";
      provider: string | null;
      date: Date | null;
      itemKind: "bill" | "renewal";
    });

export type UpdateEditableItemInput = {
  title: string;
  notes?: string | null;
  provider?: string | null;
  date?: Date | null;
  assignedMemberId?: string | null;
};

export class ItemEditingError extends Error {
  constructor(message = "This household item could not be updated.") {
    super(message);
    this.name = "ItemEditingError";
  }
}

export async function getEditableItem(
  context: HouseholdAccessContext,
  type: EditableItemType,
  id: string,
): Promise<EditableItem | null> {
  requireHouseholdPermission(context, "view_household");
  const prisma = getPrismaClient();
  const where = { id, householdId: context.householdId };

  if (type === "inbox_item") {
    const item = await prisma.inboxItem.findFirst({
      where,
      select: { id: true, title: true, description: true, assignedMemberId: true },
    });
    return item
      ? {
          id: item.id,
          type,
          title: item.title,
          notes: item.description,
          assignedMemberId: item.assignedMemberId,
        }
      : null;
  }

  if (type === "task") {
    const item = await prisma.task.findFirst({
      where,
      select: { id: true, title: true, notes: true, dueAt: true, assignedMemberId: true },
    });
    return item ? { id: item.id, type, title: item.title, notes: item.notes, date: item.dueAt, assignedMemberId: item.assignedMemberId } : null;
  }

  if (type === "reminder") {
    const item = await prisma.reminder.findFirst({
      where,
      select: { id: true, title: true, notes: true, remindAt: true, assignedMemberId: true },
    });
    return item ? { id: item.id, type, title: item.title, notes: item.notes, date: item.remindAt, assignedMemberId: item.assignedMemberId } : null;
  }

  const item = await prisma.billOrRenewal.findFirst({
    where,
    select: {
      id: true,
      title: true,
      provider: true,
      notes: true,
      type: true,
      dueAt: true,
      renewalAt: true,
      assignedMemberId: true,
    },
  });
  return item
    ? {
        id: item.id,
        type,
        title: item.title,
        provider: item.provider,
        notes: item.notes,
        itemKind: item.type,
        date: item.type === "bill" ? item.dueAt : item.renewalAt,
        assignedMemberId: item.assignedMemberId,
      }
    : null;
}

export async function updateEditableItem(
  context: HouseholdAccessContext,
  type: EditableItemType,
  id: string,
  input: UpdateEditableItemInput,
) {
  requireHouseholdPermission(context, "manage_shared_items");
  const prisma = getPrismaClient();

  await prisma.$transaction(async (tx) => {
    const member = await tx.householdMember.findFirst({
      where: {
        id: context.memberId,
        householdId: context.householdId,
        userId: context.userId,
        status: "active",
      },
      select: { id: true },
    });
    if (!member) throw new ItemEditingError();

    let assignedMemberId = input.assignedMemberId || null;
    if (type !== "inbox_item") {
      assignedMemberId ||= context.memberId;
      const assignee = await tx.householdMember.findFirst({
        where: {
          id: assignedMemberId,
          householdId: context.householdId,
          status: "active",
        },
        select: { id: true },
      });
      if (!assignee) throw new ItemEditingError("Choose an active household member.");
      assignedMemberId = assignee.id;
    }

    const where = { id, householdId: context.householdId };
    let activityEntityType: "inbox_item" | "task" | "reminder" | "bill_or_renewal";
    let activityLabel: string;

    if (type === "inbox_item") {
      const existing = await tx.inboxItem.findFirst({ where, select: { id: true } });
      if (!existing) throw new ItemEditingError();
      await tx.inboxItem.update({
        where: { id: existing.id },
        data: { title: input.title, description: input.notes || null },
      });
      activityEntityType = "inbox_item";
      activityLabel = "inbox item";
    } else if (type === "task") {
      const existing = await tx.task.findFirst({ where, select: { id: true } });
      if (!existing) throw new ItemEditingError();
      await tx.task.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          notes: input.notes || null,
          dueAt: input.date || null,
          assignedMemberId,
        },
      });
      activityEntityType = "task";
      activityLabel = "task";
    } else if (type === "reminder") {
      if (!input.date) throw new ItemEditingError("Choose a reminder date.");
      const existing = await tx.reminder.findFirst({ where, select: { id: true } });
      if (!existing) throw new ItemEditingError();
      await tx.reminder.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          notes: input.notes || null,
          remindAt: input.date,
          assignedMemberId,
        },
      });
      activityEntityType = "reminder";
      activityLabel = "reminder";
    } else {
      const existing = await tx.billOrRenewal.findFirst({
        where,
        select: { id: true, type: true },
      });
      if (!existing) throw new ItemEditingError();
      if (!input.date) {
        throw new ItemEditingError(
          existing.type === "bill" ? "Choose a due date." : "Choose a renewal date.",
        );
      }
      await tx.billOrRenewal.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          provider: input.provider || null,
          notes: input.notes || null,
          dueAt: existing.type === "bill" ? input.date : null,
          renewalAt: existing.type === "renewal" ? input.date : null,
          assignedMemberId,
        },
      });
      activityEntityType = "bill_or_renewal";
      activityLabel = existing.type === "bill" ? "bill reminder" : "renewal reminder";
    }

    await tx.activityEvent.create({
      data: {
        householdId: context.householdId,
        actorUserId: context.userId,
        actorMemberId: context.memberId,
        entityType: activityEntityType,
        entityId: id,
        eventType: "updated",
        summary: `Updated ${activityLabel}: ${input.title}`,
      },
    });
  });
}

export function isEditableItemType(value: string): value is EditableItemType {
  return value === "inbox_item" || value === "task" || value === "reminder" || value === "bill_or_renewal";
}
