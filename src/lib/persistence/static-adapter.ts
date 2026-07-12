import {
  createHouseholdScopedWhere,
  HouseholdAccessError,
  requireHouseholdPermission,
} from "@/lib/access-control";
import type { HouseholdAccessContext } from "@/lib/access-control";
import { getCurrentHouseholdComments } from "@/lib/collaboration-data";
import {
  getCurrentHouseholdActivity,
  getCurrentHouseholdBillReminders,
  getCurrentHouseholdInboxItems,
  getCurrentHouseholdReminders,
  getCurrentHouseholdShoppingLists,
  getCurrentHouseholdSourceReferences,
  getCurrentHouseholdTasks,
} from "@/lib/demo-data";
import { getCurrentHousehold, getCurrentHouseholdMembers } from "@/lib/household";
import type {
  ActivityEventSummary,
  BillOrRenewalSummary,
  CommentSummary,
  HouseholdMemberSummary,
  HouseholdPersistenceAdapter,
  HouseholdRecord,
  HouseholdSummary,
  InboxItemSummary,
  ReminderSummary,
  ShoppingListSummary,
  SourceReferenceSummary,
  TaskSummary,
} from "@/lib/persistence/contracts";

function requireStaticHousehold(context: HouseholdAccessContext) {
  requireHouseholdPermission(context, "view_household");

  const household = getCurrentHousehold();

  if (context.householdId !== household.id) {
    throw new HouseholdAccessError();
  }

  return createHouseholdScopedWhere(context);
}

function filterForHousehold<TRecord extends HouseholdRecord>(records: TRecord[], householdId: string) {
  return records.filter((record) => record.householdId === householdId);
}

function toPriorityValue(priority: string) {
  return priority.toLowerCase();
}

function toStatusValue(status: string) {
  return status.toLowerCase().replaceAll(" ", "_");
}

function toTaskStageValue(stage: string) {
  return stage.toLowerCase();
}

function inferActivityEventType(summary: string) {
  const normalized = summary.toLowerCase();

  if (normalized.includes("commented")) {
    return "commented";
  }

  if (normalized.includes("created")) {
    return "created";
  }

  return "updated";
}

function toActivityEntityType(entityType: string) {
  return entityType === "bill" ? "bill_or_renewal" : entityType;
}

function toCommentEntityType(entityType: string) {
  return entityType === "bill" ? "bill_or_renewal" : entityType;
}

export const staticHouseholdPersistenceAdapter: HouseholdPersistenceAdapter = {
  async getHousehold(context): Promise<HouseholdSummary> {
    requireStaticHousehold(context);

    const household = getCurrentHousehold();

    return {
      id: household.id,
      householdId: household.id,
      name: household.name,
      timezone: household.timezone,
    };
  },

  async listMembers(context): Promise<HouseholdMemberSummary[]> {
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdMembers(), householdId).map((member) => ({
      id: member.id,
      householdId: member.householdId,
      displayName: member.displayName,
      role: member.role,
      status: member.status,
      initials: member.initials,
    }));
  },

  async listInboxItems(context): Promise<InboxItemSummary[]> {
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdInboxItems(), householdId).map((item) => ({
      id: item.id,
      householdId: item.householdId,
      title: item.title,
      description: item.description,
      status: toStatusValue(item.status),
      category: item.category,
      priority: toPriorityValue(item.priority),
      assignedMemberId: item.assignedMemberId,
      createdByMemberId: item.createdByMemberId,
      sourceReferenceId: item.sourceReferenceId,
    }));
  },

  async createInboxItem(): Promise<InboxItemSummary> {
    throw new HouseholdAccessError(
      "Manual inbox saving is available when the private household workspace is connected.",
    );
  },

  async listTasks(context): Promise<TaskSummary[]> {
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdTasks(), householdId).map((task) => ({
      id: task.id,
      householdId: task.householdId,
      title: task.title,
      notes: task.notes,
      status: toStatusValue(task.status),
      stage: toTaskStageValue(task.stage),
      priority: toPriorityValue(task.priority),
      dueAt: null,
      assignedMemberId: task.assignedMemberId,
      createdByMemberId: task.createdByMemberId,
      sourceReferenceId: task.sourceReferenceId,
    }));
  },

  async listReminders(context): Promise<ReminderSummary[]> {
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdReminders(), householdId).map((reminder) => ({
      id: reminder.id,
      householdId: reminder.householdId,
      title: reminder.title,
      notes: reminder.notes,
      status: reminder.stage === "Scheduled" ? "scheduled" : "needs_review",
      cadence: reminder.cadence.toLowerCase(),
      remindAt: null,
      assignedMemberId: reminder.assignedMemberId,
      createdByMemberId: reminder.createdByMemberId,
    }));
  },

  async listShoppingLists(context): Promise<ShoppingListSummary[]> {
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdShoppingLists(), householdId).map((list) => ({
      id: list.id,
      householdId: list.householdId,
      name: list.name,
      status: list.status.toLowerCase(),
      createdByMemberId: list.createdByMemberId,
      openItemCount: list.items.filter((item) => !item.checked).length,
      totalItemCount: list.items.length,
    }));
  },

  async listBillsAndRenewals(context): Promise<BillOrRenewalSummary[]> {
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdBillReminders(), householdId).map((bill) => ({
      id: bill.id,
      householdId: bill.householdId,
      title: bill.title,
      provider: bill.provider,
      type: bill.type,
      status: toStatusValue(bill.status),
      dueAt: null,
      renewalAt: null,
      assignedMemberId: bill.assignedMemberId,
      createdByMemberId: bill.createdByMemberId,
      sourceReferenceId: bill.sourceReferenceId,
    }));
  },

  async listSourceReferences(context): Promise<SourceReferenceSummary[]> {
    requireHouseholdPermission(context, "view_source_references");
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdSourceReferences(), householdId).map((source) => ({
      id: source.id,
      householdId: source.householdId,
      title: source.title,
      kind: source.kind,
      label: source.label,
      reviewStatus: toStatusValue(source.reviewStatus),
      sensitivity: source.sensitivity.toLowerCase(),
      createdByMemberId: source.createdByMemberId,
    }));
  },

  async listComments(context): Promise<CommentSummary[]> {
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdComments(), householdId).map((comment) => ({
      id: comment.id,
      householdId: comment.householdId,
      entityType: toCommentEntityType(comment.entityType),
      entityId: comment.entityTitle,
      body: comment.body,
      createdByMemberId: comment.createdByMemberId,
      createdAt: new Date(0),
    }));
  },

  async listActivity(context): Promise<ActivityEventSummary[]> {
    const { householdId } = requireStaticHousehold(context);

    return filterForHousehold(getCurrentHouseholdActivity(), householdId).map((event) => ({
      id: event.id,
      householdId: event.householdId,
      entityType: toActivityEntityType(event.entityType),
      entityId: null,
      eventType: inferActivityEventType(event.summary),
      summary: event.summary,
      actorMemberId: event.actorMemberId,
      createdAt: new Date(0),
    }));
  },
};
