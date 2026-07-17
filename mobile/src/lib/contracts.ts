export type HouseholdRole = "household_admin" | "household_member";

type Envelope = {
  apiVersion: "1";
  generatedAt: string;
};

export type Member = {
  id: string;
  displayName: string;
  initials: string;
  role: HouseholdRole;
};

export type BootstrapResponse = Envelope & {
  household: { id: string; name: string; timezone: string };
  currentMember: Member;
  members: Member[];
  counts: {
    inbox: number;
    tasks: number;
    reminders: number;
    shoppingItems: number;
    billsAndRenewals: number;
    sourceReferencesNeedingReview: number;
  };
  capabilities: {
    canManageHousehold: boolean;
    canManageMembers: boolean;
    canManageSharedItems: boolean;
    canViewSourceReferences: boolean;
  };
};

export type InboxResponse = Envelope & {
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    category: string;
    priority: string;
    assignedMemberId: string | null;
    createdByMemberId: string;
    sourceReferenceId: string | null;
  }>;
};

export type TasksResponse = Envelope & {
  tasks: Array<{
    id: string;
    title: string;
    notes: string | null;
    status: string;
    stage: string;
    priority: string;
    dueAt: string | null;
    assignedMemberId: string | null;
    createdByMemberId: string;
    sourceReferenceId: string | null;
  }>;
  reminders: Array<{
    id: string;
    title: string;
    notes: string | null;
    status: string;
    cadence: string;
    remindAt: string | null;
    assignedMemberId: string | null;
    createdByMemberId: string;
  }>;
};

export type ShoppingResponse = Envelope & {
  lists: Array<{
    id: string;
    name: string;
    status: string;
    createdByMemberId: string;
    openItemCount: number;
    totalItemCount: number;
  }>;
  items: Array<{
    id: string;
    shoppingListId: string;
    label: string;
    notes: string | null;
    quantity: string | null;
    category: string | null;
    checked: boolean;
    assignedMemberId: string | null;
    createdByMemberId: string;
  }>;
};

export type SourceReference = {
  id: string;
  title: string;
  kind: string;
  label: string;
  url: string | null;
  reviewStatus: string;
  sensitivity: string;
  createdByMemberId: string;
};

export type BillsResponse = Envelope & {
  items: Array<{
    id: string;
    title: string;
    provider: string | null;
    type: "bill" | "renewal";
    status: string;
    dueAt: string | null;
    renewalAt: string | null;
    assignedMemberId: string | null;
    createdByMemberId: string;
    sourceReferenceId: string | null;
  }>;
  sources: SourceReference[];
};

export type SourcesResponse = Envelope & { sources: SourceReference[] };

export type CommentTarget = {
  entityType: "inbox_item" | "task" | "reminder" | "shopping_list" | "bill_or_renewal" | "source_reference";
  entityId: string;
  label: string;
  group: string;
};

export type ActivityResponse = Envelope & {
  comments: Array<{
    id: string;
    entityType: string;
    entityId: string;
    body: string;
    createdByMemberId: string;
    createdAt: string;
  }>;
  events: Array<{
    id: string;
    entityType: string;
    entityId: string | null;
    eventType: string;
    summary: string;
    actorMemberId: string | null;
    createdAt: string;
  }>;  }>;
  targets: CommentTarget[];
};
