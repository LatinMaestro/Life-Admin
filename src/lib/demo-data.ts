import { getCurrentHousehold, memberIds } from "@/lib/household";

type SourceKind = "source_link" | "source_document_reference" | "source_image_reference";
export type InboxStatus = "New" | "Needs review" | "Linked";
export type InboxCategory = "school" | "appointment" | "renewal";
export type InboxDestination = "task" | "reminder" | "bill_or_renewal" | "source_reference";
export type TaskStatus = "Open" | "Done";
export type TaskPriority = "Low" | "Normal" | "High";
export type TaskStage = "Capture" | "Action" | "Review" | "Done";
export type ReminderCadence = "Once" | "Weekly" | "Monthly";
export type ReminderStage = "Scheduled" | "Review";

interface HouseholdScopedRecord {
  id: string;
  householdId: string;
}

export interface SourceReference extends HouseholdScopedRecord {
  title: string;
  kind: SourceKind;
  label: string;
  relatedHref: string;
  createdByMemberId: string;
}

export interface DashboardItem extends HouseholdScopedRecord {
  title: string;
  detail: string;
  status: string;
  assignedMemberId?: string;
  createdByMemberId: string;
}

export interface InboxItem extends HouseholdScopedRecord {
  title: string;
  description: string;
  status: InboxStatus;
  category: InboxCategory;
  suggestedDestination: InboxDestination;
  assignedMemberId?: string;
  createdByMemberId: string;
  sourceReferenceId: string;
}

export interface Task extends HouseholdScopedRecord {
  title: string;
  due: string;
  status: TaskStatus;
  stage: TaskStage;
  priority: TaskPriority;
  notes: string;
  checklist: string[];
  sourceReferenceId?: string;
  assignedMemberId: string;
  createdByMemberId: string;
}

export interface Reminder extends HouseholdScopedRecord {
  title: string;
  due: string;
  cadence: ReminderCadence;
  stage: ReminderStage;
  nextStep: string;
  notes: string;
  assignedMemberId?: string;
  createdByMemberId: string;
}

export interface ShoppingListItem extends HouseholdScopedRecord {
  shoppingListId: string;
  label: string;
  quantity: string;
  category: string;
  notes: string;
  checked: boolean;
  assignedMemberId?: string;
  createdByMemberId: string;
}

export interface ShoppingList extends HouseholdScopedRecord {
  name: string;
  detail: string;
  status: "Active";
  nextShop: string;
  createdByMemberId: string;
  items: ShoppingListItem[];
}

export interface BillReminder extends HouseholdScopedRecord {
  title: string;
  provider: string;
  due: string;
  reminderWindow: string;
  nextStep: string;
  reviewChecklist: string[];
  notes: string;
  status: "Upcoming" | "Needs review" | "Scheduled";
  type: "bill" | "renewal";
  assignedMemberId: string;
  createdByMemberId: string;
  sourceReferenceId: string;
}

export interface ActivityEvent extends HouseholdScopedRecord {
  summary: string;
  actorMemberId: string;
  entityType: "bill" | "shopping_list" | "task";
}

const household = getCurrentHousehold();

const sourceReferences: SourceReference[] = [
  {
    id: "source_school_excursion",
    householdId: household.id,
    title: "School excursion note",
    kind: "source_link",
    label: "Source link",
    relatedHref: "/inbox",
    createdByMemberId: memberIds.alex,
  },
  {
    id: "source_vet_card",
    householdId: household.id,
    title: "Vet appointment card",
    kind: "source_image_reference",
    label: "Image reference",
    relatedHref: "/inbox",
    createdByMemberId: memberIds.morgan,
  },
  {
    id: "source_home_service_notice",
    householdId: household.id,
    title: "Home service renewal notice",
    kind: "source_document_reference",
    label: "Original notice reference",
    relatedHref: "/inbox",
    createdByMemberId: memberIds.alex,
  },
  {
    id: "source_council_rates",
    householdId: household.id,
    title: "Council rates notice",
    kind: "source_document_reference",
    label: "Original PDF reference",
    relatedHref: "/bills",
    createdByMemberId: memberIds.alex,
  },
  {
    id: "source_home_insurance",
    householdId: household.id,
    title: "Home insurance renewal",
    kind: "source_link",
    label: "Provider portal link",
    relatedHref: "/bills",
    createdByMemberId: memberIds.morgan,
  },
  {
    id: "source_car_registration",
    householdId: household.id,
    title: "Car registration reminder",
    kind: "source_document_reference",
    label: "Original notice reference",
    relatedHref: "/bills",
    createdByMemberId: memberIds.jordan,
  },
];

const dashboardItems = {
  today: [
    {
      id: "dashboard_school_forms",
      householdId: household.id,
      title: "Pack school forms",
      detail: "Assigned to Alex",
      status: "Due today",
      assignedMemberId: memberIds.alex,
      createdByMemberId: memberIds.morgan,
    },
    {
      id: "dashboard_pantry",
      householdId: household.id,
      title: "Check pantry staples",
      detail: "Shopping list review",
      status: "Quick task",
      assignedMemberId: memberIds.jordan,
      createdByMemberId: memberIds.alex,
    },
  ],
  overdue: [
    {
      id: "dashboard_dentist",
      householdId: household.id,
      title: "Book dentist appointment",
      detail: "Reminder from shared inbox",
      status: "Overdue",
      assignedMemberId: memberIds.morgan,
      createdByMemberId: memberIds.alex,
    },
  ],
  upcoming: [
    {
      id: "dashboard_library",
      householdId: household.id,
      title: "Renew library membership",
      detail: "Source link saved",
      status: "Friday",
      assignedMemberId: memberIds.alex,
      createdByMemberId: memberIds.alex,
    },
    {
      id: "dashboard_garden",
      householdId: household.id,
      title: "Garden service reminder",
      detail: "Assigned to Morgan",
      status: "Next week",
      assignedMemberId: memberIds.morgan,
      createdByMemberId: memberIds.jordan,
    },
  ],
} satisfies Record<string, DashboardItem[]>;

const inboxItems: InboxItem[] = [
  {
    id: "inbox_school_excursion",
    householdId: household.id,
    title: "School excursion note",
    description: "Manual inbox item for review and follow-up.",
    status: "New",
    category: "school",
    suggestedDestination: "task",
    assignedMemberId: memberIds.alex,
    createdByMemberId: memberIds.morgan,
    sourceReferenceId: "source_school_excursion",
  },
  {
    id: "inbox_vet_card",
    householdId: household.id,
    title: "Vet appointment card",
    description: "Turn into a household reminder after confirming the date.",
    status: "Needs review",
    category: "appointment",
    suggestedDestination: "reminder",
    assignedMemberId: memberIds.morgan,
    createdByMemberId: memberIds.alex,
    sourceReferenceId: "source_vet_card",
  },
  {
    id: "inbox_home_service",
    householdId: household.id,
    title: "Home service renewal notice",
    description: "Link to a renewal reminder with the saved notice as the source.",
    status: "Linked",
    category: "renewal",
    suggestedDestination: "bill_or_renewal",
    assignedMemberId: memberIds.jordan,
    createdByMemberId: memberIds.morgan,
    sourceReferenceId: "source_home_service_notice",
  },
];

const tasks: Task[] = [
  {
    id: "task_bins",
    householdId: household.id,
    title: "Put bins out",
    due: "Tonight",
    priority: "High",
    stage: "Action",
    notes: "Move bins to the kerb before bedtime.",
    checklist: ["Check collection calendar", "Move bins to kerb", "Bring bins back after collection"],
    assignedMemberId: memberIds.jordan,
    createdByMemberId: memberIds.alex,
    status: "Open",
  },
  {
    id: "task_sports_bag",
    householdId: household.id,
    title: "Prepare sports bag",
    due: "Tomorrow morning",
    priority: "Normal",
    stage: "Capture",
    notes: "Pack shoes, uniform, water bottle, and permission slip.",
    checklist: ["Confirm uniform is dry", "Pack water bottle", "Add permission slip"],
    sourceReferenceId: "source_school_excursion",
    assignedMemberId: memberIds.taylor,
    createdByMemberId: memberIds.morgan,
    status: "Open",
  },
  {
    id: "task_school_pickup",
    householdId: household.id,
    title: "Confirm school pickup",
    due: "Today",
    priority: "Normal",
    stage: "Done",
    notes: "Pickup confirmed for the usual afternoon time.",
    checklist: ["Confirm pickup owner", "Share update with household"],
    assignedMemberId: memberIds.alex,
    createdByMemberId: memberIds.alex,
    status: "Done",
  },
];

const reminders: Reminder[] = [
  {
    id: "reminder_smoke_alarm",
    householdId: household.id,
    title: "Check smoke alarm date",
    due: "Saturday",
    cadence: "Monthly",
    stage: "Scheduled",
    nextStep: "Check date and mark the monthly review complete.",
    notes: "Check the date during the monthly household review.",
    assignedMemberId: memberIds.morgan,
    createdByMemberId: memberIds.alex,
  },
  {
    id: "reminder_library_books",
    householdId: household.id,
    title: "Library books due",
    due: "Next Tuesday",
    cadence: "Once",
    stage: "Review",
    nextStep: "Confirm whether books should be returned or renewed.",
    notes: "Return or renew before the due date.",
    createdByMemberId: memberIds.jordan,
  },
];

const shoppingLists: ShoppingList[] = [
  {
    id: "list_groceries",
    householdId: household.id,
    name: "Groceries",
    detail: "Shared weekly list",
    status: "Active",
    nextShop: "Weekly supermarket run",
    createdByMemberId: memberIds.alex,
    items: [
      {
        id: "item_milk",
        householdId: household.id,
        shoppingListId: "list_groceries",
        label: "Milk",
        quantity: "2 L",
        category: "Fridge",
        notes: "Regular milk for breakfasts.",
        checked: false,
        createdByMemberId: memberIds.alex,
      },
      {
        id: "item_bread",
        householdId: household.id,
        shoppingListId: "list_groceries",
        label: "Bread",
        quantity: "1 loaf",
        category: "Bakery",
        notes: "Already picked up.",
        checked: true,
        assignedMemberId: memberIds.taylor,
        createdByMemberId: memberIds.morgan,
      },
      {
        id: "item_lunchbox_fruit",
        householdId: household.id,
        shoppingListId: "list_groceries",
        label: "Lunchbox fruit",
        quantity: "6 pieces",
        category: "Produce",
        notes: "Apples or mandarins are fine.",
        checked: false,
        createdByMemberId: memberIds.alex,
      },
    ],
  },
  {
    id: "list_home_supplies",
    householdId: household.id,
    name: "Home supplies",
    detail: "Household basics",
    status: "Active",
    nextShop: "Next household supply top-up",
    createdByMemberId: memberIds.morgan,
    items: [
      {
        id: "item_laundry_powder",
        householdId: household.id,
        shoppingListId: "list_home_supplies",
        label: "Laundry powder",
        quantity: "1 box",
        category: "Laundry",
        notes: "Low in the laundry cupboard.",
        checked: false,
        createdByMemberId: memberIds.morgan,
      },
      {
        id: "item_kitchen_cloths",
        householdId: household.id,
        shoppingListId: "list_home_supplies",
        label: "Kitchen cloths",
        quantity: "1 pack",
        category: "Kitchen",
        notes: "Replace worn cloths.",
        checked: false,
        createdByMemberId: memberIds.jordan,
      },
    ],
  },
];

const billReminders: BillReminder[] = [
  {
    id: "bill_council_rates",
    householdId: household.id,
    title: "Council rates notice",
    provider: "Local council",
    due: "Due 18 Jul",
    reminderWindow: "Review this week",
    nextStep: "Open the original PDF reference and confirm the due date before taking action.",
    reviewChecklist: ["Open original source", "Confirm due date", "Record household action taken"],
    notes: "Open the original PDF reference before taking action.",
    status: "Upcoming",
    type: "bill",
    assignedMemberId: memberIds.alex,
    createdByMemberId: memberIds.alex,
    sourceReferenceId: "source_council_rates",
  },
  {
    id: "bill_home_insurance",
    householdId: household.id,
    title: "Home insurance renewal",
    provider: "Insurance provider",
    due: "Renewal 28 Jul",
    reminderWindow: "Compare renewal notice",
    nextStep: "Review the provider portal source and decide whether the renewal needs household discussion.",
    reviewChecklist: ["Open provider source", "Review cover dates", "Add household comment"],
    notes: "Review cover dates and keep the provider portal as the source reference.",
    status: "Needs review",
    type: "renewal",
    assignedMemberId: memberIds.morgan,
    createdByMemberId: memberIds.morgan,
    sourceReferenceId: "source_home_insurance",
  },
  {
    id: "bill_car_registration",
    householdId: household.id,
    title: "Car registration reminder",
    provider: "Transport service",
    due: "Due 4 Aug",
    reminderWindow: "Scheduled check-in",
    nextStep: "Confirm the renewal notice in the saved source reference.",
    reviewChecklist: ["Open original notice", "Confirm renewal date", "Keep source reference attached"],
    notes: "Confirm the renewal notice in the saved source reference.",
    status: "Scheduled",
    type: "renewal",
    assignedMemberId: memberIds.jordan,
    createdByMemberId: memberIds.alex,
    sourceReferenceId: "source_car_registration",
  },
];

const activity: ActivityEvent[] = [
  {
    id: "activity_renewal_created",
    householdId: household.id,
    summary: "Alex created a renewal reminder.",
    actorMemberId: memberIds.alex,
    entityType: "bill",
  },
  {
    id: "activity_shopping_checked",
    householdId: household.id,
    summary: "Morgan checked off a shopping item.",
    actorMemberId: memberIds.morgan,
    entityType: "shopping_list",
  },
  {
    id: "activity_task_comment",
    householdId: household.id,
    summary: "Jordan commented on a task.",
    actorMemberId: memberIds.jordan,
    entityType: "task",
  },
];

function forCurrentHousehold<T extends HouseholdScopedRecord>(records: T[]) {
  return records.filter((record) => record.householdId === household.id);
}

export function getCurrentHouseholdDashboardItems() {
  return {
    today: forCurrentHousehold(dashboardItems.today),
    overdue: forCurrentHousehold(dashboardItems.overdue),
    upcoming: forCurrentHousehold(dashboardItems.upcoming),
  };
}

export function getCurrentHouseholdInboxItems() {
  return forCurrentHousehold(inboxItems);
}

export function getInboxCategoryLabel(category: InboxCategory) {
  const labels: Record<InboxCategory, string> = {
    school: "School",
    appointment: "Appointment",
    renewal: "Renewal",
  };

  return labels[category];
}

export function getInboxDestinationLabel(destination: InboxDestination) {
  const labels: Record<InboxDestination, string> = {
    task: "Task",
    reminder: "Reminder",
    bill_or_renewal: "Bill or renewal",
    source_reference: "Source reference",
  };

  return labels[destination];
}

export function getCurrentHouseholdTasks() {
  return forCurrentHousehold(tasks);
}

export function getCurrentHouseholdReminders() {
  return forCurrentHousehold(reminders);
}

export function getTaskPriorityLabel(priority: TaskPriority) {
  return `${priority} priority`;
}

export function getTaskStageLabel(stage: TaskStage) {
  const labels: Record<TaskStage, string> = {
    Capture: "Captured",
    Action: "Action needed",
    Review: "Ready to review",
    Done: "Done",
  };

  return labels[stage];
}

export function getReminderCadenceLabel(cadence: ReminderCadence) {
  return cadence === "Once" ? "One-off" : cadence;
}

export function getReminderStageLabel(stage: ReminderStage) {
  return stage === "Scheduled" ? "Scheduled" : "Needs review";
}

export function getCurrentHouseholdShoppingLists() {
  return forCurrentHousehold(shoppingLists);
}

export function getCurrentHouseholdBillReminders() {
  return forCurrentHousehold(billReminders);
}

export function getCurrentHouseholdSourceReferences() {
  return forCurrentHousehold(sourceReferences);
}

export function getCurrentHouseholdActivity() {
  return forCurrentHousehold(activity);
}

export function getSourceKindLabel(kind: SourceKind) {
  const labels: Record<SourceKind, string> = {
    source_link: "Source link",
    source_document_reference: "Document reference",
    source_image_reference: "Image reference",
  };

  return labels[kind];
}

export function getSourceReferenceLabel(sourceReferenceId: string) {
  return sourceReferences.find((source) => source.id === sourceReferenceId)?.label ?? "Source reference";
}
