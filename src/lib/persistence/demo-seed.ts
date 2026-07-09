import {
  getCurrentHouseholdActivity,
  getCurrentHouseholdBillReminders,
  getCurrentHouseholdInboxItems,
  getCurrentHouseholdReminders,
  getCurrentHouseholdShoppingLists,
  getCurrentHouseholdSourceReferences,
  getCurrentHouseholdTasks,
} from "@/lib/demo-data";
import type {
  ActivityEvent,
  BillReminder,
  InboxCategory,
  InboxDestination,
  InboxPriority,
  InboxStatus,
  ReminderCadence,
  ReminderStage,
  SourceReference,
  SourceReviewStatus,
  SourceSensitivity,
  TaskPriority,
  TaskStage,
  TaskStatus,
} from "@/lib/demo-data";
import { getCurrentHousehold, getCurrentHouseholdMembers } from "@/lib/household";
import type { HouseholdMember } from "@/lib/household";

type DemoUserSeed = {
  id: string;
  name: string;
  email: string;
};

type DemoHouseholdSeed = {
  id: string;
  name: string;
  timezone: string;
};

type DemoHouseholdSettingsSeed = {
  id: string;
  householdId: string;
  defaultTimezone: string;
};

type DemoHouseholdMemberSeed = {
  id: string;
  householdId: string;
  userId: string;
  role: "household_admin" | "household_member";
  status: "active";
  displayName: string;
  initials: string;
  joinedAt: Date;
};

type DemoSourceReferenceSeed = {
  id: string;
  householdId: string;
  title: string;
  kind: "source_link" | "source_document_reference" | "source_image_reference";
  label: string;
  reviewStatus: "needs_review" | "confirmed" | "linked";
  sensitivity: "standard" | "sensitive";
  handlingNotes: string;
  createdByMemberId: string;
};

type DemoInboxItemSeed = {
  id: string;
  householdId: string;
  title: string;
  description: string;
  status: "new" | "needs_review" | "linked";
  category: "school" | "appointment" | "renewal";
  priority: "low" | "normal" | "high";
  suggestedDestination: "task" | "reminder" | "bill_or_renewal" | "source_reference";
  routingReason: string;
  triageSteps: string[];
  assignedMemberId?: string;
  createdByMemberId: string;
  sourceReferenceId: string;
};

type DemoTaskSeed = {
  id: string;
  householdId: string;
  title: string;
  notes: string;
  status: "open" | "done";
  stage: "capture" | "action" | "review" | "done";
  priority: "low" | "normal" | "high";
  dueLabel: string;
  dueAt: null;
  checklist: string[];
  assignedMemberId: string;
  createdByMemberId: string;
  sourceReferenceId?: string;
};

type DemoReminderSeed = {
  id: string;
  householdId: string;
  title: string;
  notes: string;
  status: "scheduled";
  cadence: "once" | "weekly" | "monthly";
  dueLabel: string;
  remindAt: null;
  assignedMemberId?: string;
  createdByMemberId: string;
};

type DemoShoppingListSeed = {
  id: string;
  householdId: string;
  name: string;
  status: "active";
  createdByMemberId: string;
};

type DemoShoppingListItemSeed = {
  id: string;
  householdId: string;
  shoppingListId: string;
  label: string;
  notes: string;
  quantity: string;
  category: string;
  checked: boolean;
  assignedMemberId?: string;
  createdByMemberId: string;
};

type DemoBillOrRenewalSeed = {
  id: string;
  householdId: string;
  title: string;
  provider: string;
  type: "bill" | "renewal";
  status: "upcoming" | "needs_review" | "scheduled";
  dueLabel: string;
  dueAt: null;
  renewalAt: null;
  reminderWindow: string;
  nextStep: string;
  reviewChecklist: string[];
  notes: string;
  assignedMemberId: string;
  createdByMemberId: string;
  sourceReferenceId: string;
};

type DemoActivityEventSeed = {
  id: string;
  householdId: string;
  actorMemberId: string;
  entityType: "bill_or_renewal" | "shopping_list" | "task";
  eventType: "created" | "updated" | "commented";
  summary: string;
};

export type DemoSeedSnapshot = {
  users: DemoUserSeed[];
  household: DemoHouseholdSeed;
  settings: DemoHouseholdSettingsSeed;
  members: DemoHouseholdMemberSeed[];
  sourceReferences: DemoSourceReferenceSeed[];
  inboxItems: DemoInboxItemSeed[];
  tasks: DemoTaskSeed[];
  reminders: DemoReminderSeed[];
  shoppingLists: DemoShoppingListSeed[];
  shoppingListItems: DemoShoppingListItemSeed[];
  billsAndRenewals: DemoBillOrRenewalSeed[];
  activityEvents: DemoActivityEventSeed[];
};

const inboxStatusMap: Record<InboxStatus, DemoInboxItemSeed["status"]> = {
  New: "new",
  "Needs review": "needs_review",
  Linked: "linked",
};

const inboxPriorityMap: Record<InboxPriority, DemoInboxItemSeed["priority"]> = {
  Low: "low",
  Normal: "normal",
  High: "high",
};

const taskStatusMap: Record<TaskStatus, DemoTaskSeed["status"]> = {
  Open: "open",
  Done: "done",
};

const taskStageMap: Record<TaskStage, DemoTaskSeed["stage"]> = {
  Capture: "capture",
  Action: "action",
  Review: "review",
  Done: "done",
};

const taskPriorityMap: Record<TaskPriority, DemoTaskSeed["priority"]> = {
  Low: "low",
  Normal: "normal",
  High: "high",
};

const reminderCadenceMap: Record<ReminderCadence, DemoReminderSeed["cadence"]> = {
  Once: "once",
  Weekly: "weekly",
  Monthly: "monthly",
};

const sourceReviewStatusMap: Record<SourceReviewStatus, DemoSourceReferenceSeed["reviewStatus"]> = {
  Confirmed: "confirmed",
  "Needs review": "needs_review",
  Linked: "linked",
};

const sourceSensitivityMap: Record<SourceSensitivity, DemoSourceReferenceSeed["sensitivity"]> = {
  Standard: "standard",
  Sensitive: "sensitive",
};

const reminderStatusMap: Record<ReminderStage, DemoReminderSeed["status"]> = {
  Scheduled: "scheduled",
  Review: "scheduled",
};

const billStatusMap: Record<BillReminder["status"], DemoBillOrRenewalSeed["status"]> = {
  Upcoming: "upcoming",
  "Needs review": "needs_review",
  Scheduled: "scheduled",
};

function getDemoUserId(member: HouseholdMember) {
  return `user_${member.id.replace(/^member_/, "")}`;
}

function getDemoEmail(member: HouseholdMember) {
  return `${member.id.replace(/^member_/, "")}@example.invalid`;
}

function mapInboxCategory(category: InboxCategory): DemoInboxItemSeed["category"] {
  return category;
}

function mapInboxDestination(destination: InboxDestination): DemoInboxItemSeed["suggestedDestination"] {
  return destination;
}

function mapSourceKind(kind: SourceReference["kind"]): DemoSourceReferenceSeed["kind"] {
  return kind;
}

function mapActivityEntityType(entityType: ActivityEvent["entityType"]): DemoActivityEventSeed["entityType"] {
  if (entityType === "bill") {
    return "bill_or_renewal";
  }

  return entityType;
}

function inferActivityEventType(event: ActivityEvent): DemoActivityEventSeed["eventType"] {
  if (event.entityType === "task") {
    return "commented";
  }

  return event.summary.toLowerCase().includes("created") ? "created" : "updated";
}

export function getDemoSeedSnapshot(): DemoSeedSnapshot {
  const household = getCurrentHousehold();
  const members = getCurrentHouseholdMembers();
  const shoppingLists = getCurrentHouseholdShoppingLists();

  return {
    users: members.map((member) => ({
      id: getDemoUserId(member),
      name: member.displayName,
      email: getDemoEmail(member),
    })),
    household: {
      id: household.id,
      name: household.name,
      timezone: household.timezone,
    },
    settings: {
      id: `settings_${household.id}`,
      householdId: household.id,
      defaultTimezone: household.timezone,
    },
    members: members.map((member) => ({
      id: member.id,
      householdId: member.householdId,
      userId: getDemoUserId(member),
      role: member.role,
      status: member.status,
      displayName: member.displayName,
      initials: member.initials,
      joinedAt: new Date(member.joinedAt),
    })),
    sourceReferences: getCurrentHouseholdSourceReferences().map((source) => ({
      id: source.id,
      householdId: source.householdId,
      title: source.title,
      kind: mapSourceKind(source.kind),
      label: source.label,
      reviewStatus: sourceReviewStatusMap[source.reviewStatus],
      sensitivity: sourceSensitivityMap[source.sensitivity],
      handlingNotes: source.handlingNotes,
      createdByMemberId: source.createdByMemberId,
    })),
    inboxItems: getCurrentHouseholdInboxItems().map((item) => ({
      id: item.id,
      householdId: item.householdId,
      title: item.title,
      description: item.description,
      status: inboxStatusMap[item.status],
      category: mapInboxCategory(item.category),
      priority: inboxPriorityMap[item.priority],
      suggestedDestination: mapInboxDestination(item.suggestedDestination),
      routingReason: item.routingReason,
      triageSteps: item.triageSteps,
      assignedMemberId: item.assignedMemberId,
      createdByMemberId: item.createdByMemberId,
      sourceReferenceId: item.sourceReferenceId,
    })),
    tasks: getCurrentHouseholdTasks().map((task) => ({
      id: task.id,
      householdId: task.householdId,
      title: task.title,
      notes: task.notes,
      status: taskStatusMap[task.status],
      stage: taskStageMap[task.stage],
      priority: taskPriorityMap[task.priority],
      dueLabel: task.due,
      dueAt: null,
      checklist: task.checklist,
      assignedMemberId: task.assignedMemberId,
      createdByMemberId: task.createdByMemberId,
      sourceReferenceId: task.sourceReferenceId,
    })),
    reminders: getCurrentHouseholdReminders().map((reminder) => ({
      id: reminder.id,
      householdId: reminder.householdId,
      title: reminder.title,
      notes: reminder.notes,
      status: reminderStatusMap[reminder.stage],
      cadence: reminderCadenceMap[reminder.cadence],
      dueLabel: reminder.due,
      remindAt: null,
      assignedMemberId: reminder.assignedMemberId,
      createdByMemberId: reminder.createdByMemberId,
    })),
    shoppingLists: shoppingLists.map((list) => ({
      id: list.id,
      householdId: list.householdId,
      name: list.name,
      status: "active",
      createdByMemberId: list.createdByMemberId,
    })),
    shoppingListItems: shoppingLists.flatMap((list) =>
      list.items.map((item) => ({
        id: item.id,
        householdId: item.householdId,
        shoppingListId: item.shoppingListId,
        label: item.label,
        notes: item.notes,
        quantity: item.quantity,
        category: item.category,
        checked: item.checked,
        assignedMemberId: item.assignedMemberId,
        createdByMemberId: item.createdByMemberId,
      })),
    ),
    billsAndRenewals: getCurrentHouseholdBillReminders().map((bill) => ({
      id: bill.id,
      householdId: bill.householdId,
      title: bill.title,
      provider: bill.provider,
      type: bill.type,
      status: billStatusMap[bill.status],
      dueLabel: bill.due,
      dueAt: null,
      renewalAt: null,
      reminderWindow: bill.reminderWindow,
      nextStep: bill.nextStep,
      reviewChecklist: bill.reviewChecklist,
      notes: bill.notes,
      assignedMemberId: bill.assignedMemberId,
      createdByMemberId: bill.createdByMemberId,
      sourceReferenceId: bill.sourceReferenceId,
    })),
    activityEvents: getCurrentHouseholdActivity().map((event) => ({
      id: event.id,
      householdId: event.householdId,
      actorMemberId: event.actorMemberId,
      entityType: mapActivityEntityType(event.entityType),
      eventType: inferActivityEventType(event),
      summary: event.summary,
    })),
  };
}
