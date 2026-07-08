import { getCurrentHousehold, memberIds } from "@/lib/household";

type SourceKind = "source_link" | "source_document_reference" | "source_image_reference";

interface HouseholdScopedRecord {
  id: string;
  householdId: string;
}

export interface SourceReference extends HouseholdScopedRecord {
  title: string;
  kind: SourceKind;
  label: string;
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
  status: "New" | "Needs review" | "Linked";
  category: "school" | "appointment" | "renewal";
  assignedMemberId?: string;
  createdByMemberId: string;
  sourceReferenceId: string;
}

export interface Task extends HouseholdScopedRecord {
  title: string;
  due: string;
  status: "Open" | "Done";
  assignedMemberId: string;
  createdByMemberId: string;
}

export interface Reminder extends HouseholdScopedRecord {
  title: string;
  due: string;
  assignedMemberId?: string;
  createdByMemberId: string;
}

export interface ShoppingListItem extends HouseholdScopedRecord {
  shoppingListId: string;
  label: string;
  checked: boolean;
  assignedMemberId?: string;
  createdByMemberId: string;
}

export interface ShoppingList extends HouseholdScopedRecord {
  name: string;
  detail: string;
  status: "Active";
  createdByMemberId: string;
  items: ShoppingListItem[];
}

export interface BillReminder extends HouseholdScopedRecord {
  title: string;
  provider: string;
  due: string;
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
    label: "Source link placeholder",
    createdByMemberId: memberIds.alex,
  },
  {
    id: "source_vet_card",
    householdId: household.id,
    title: "Vet appointment card",
    kind: "source_image_reference",
    label: "Image reference placeholder",
    createdByMemberId: memberIds.morgan,
  },
  {
    id: "source_home_service_notice",
    householdId: household.id,
    title: "Home service renewal notice",
    kind: "source_document_reference",
    label: "Original notice reference",
    createdByMemberId: memberIds.alex,
  },
  {
    id: "source_council_rates",
    householdId: household.id,
    title: "Council rates notice",
    kind: "source_document_reference",
    label: "Original PDF reference",
    createdByMemberId: memberIds.alex,
  },
  {
    id: "source_home_insurance",
    householdId: household.id,
    title: "Home insurance renewal",
    kind: "source_link",
    label: "Provider portal link",
    createdByMemberId: memberIds.morgan,
  },
  {
    id: "source_car_registration",
    householdId: household.id,
    title: "Car registration reminder",
    kind: "source_document_reference",
    label: "Original notice reference placeholder",
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
    assignedMemberId: memberIds.morgan,
    createdByMemberId: memberIds.alex,
    sourceReferenceId: "source_vet_card",
  },
  {
    id: "inbox_home_service",
    householdId: household.id,
    title: "Home service renewal notice",
    description: "Link to a renewal reminder without copying payment details.",
    status: "Linked",
    category: "renewal",
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
    assignedMemberId: memberIds.jordan,
    createdByMemberId: memberIds.alex,
    status: "Open",
  },
  {
    id: "task_sports_bag",
    householdId: household.id,
    title: "Prepare sports bag",
    due: "Tomorrow morning",
    assignedMemberId: memberIds.taylor,
    createdByMemberId: memberIds.morgan,
    status: "Open",
  },
  {
    id: "task_school_pickup",
    householdId: household.id,
    title: "Confirm school pickup",
    due: "Today",
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
    assignedMemberId: memberIds.morgan,
    createdByMemberId: memberIds.alex,
  },
  {
    id: "reminder_library_books",
    householdId: household.id,
    title: "Library books due",
    due: "Next Tuesday",
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
    createdByMemberId: memberIds.alex,
    items: [
      {
        id: "item_milk",
        householdId: household.id,
        shoppingListId: "list_groceries",
        label: "Milk",
        checked: false,
        createdByMemberId: memberIds.alex,
      },
      {
        id: "item_bread",
        householdId: household.id,
        shoppingListId: "list_groceries",
        label: "Bread",
        checked: true,
        assignedMemberId: memberIds.taylor,
        createdByMemberId: memberIds.morgan,
      },
      {
        id: "item_lunchbox_fruit",
        householdId: household.id,
        shoppingListId: "list_groceries",
        label: "Lunchbox fruit",
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
    createdByMemberId: memberIds.morgan,
    items: [
      {
        id: "item_laundry_powder",
        householdId: household.id,
        shoppingListId: "list_home_supplies",
        label: "Laundry powder",
        checked: false,
        createdByMemberId: memberIds.morgan,
      },
      {
        id: "item_kitchen_cloths",
        householdId: household.id,
        shoppingListId: "list_home_supplies",
        label: "Kitchen cloths",
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

export function getCurrentHouseholdTasks() {
  return forCurrentHousehold(tasks);
}

export function getCurrentHouseholdReminders() {
  return forCurrentHousehold(reminders);
}

export function getCurrentHouseholdShoppingLists() {
  return forCurrentHousehold(shoppingLists);
}

export function getCurrentHouseholdBillReminders() {
  return forCurrentHousehold(billReminders);
}

export function getCurrentHouseholdActivity() {
  return forCurrentHousehold(activity);
}

export function getSourceReferenceLabel(sourceReferenceId: string) {
  return sourceReferences.find((source) => source.id === sourceReferenceId)?.label ?? "Source reference";
}
