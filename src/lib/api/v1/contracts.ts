import type { HouseholdRole } from "@/lib/access-control";

export type MobileApiErrorCode =
  | "authentication_required"
  | "household_access_required"
  | "invalid_request"
  | "live_mode_required"
  | "unexpected_error";

export type MobileApiError = {
  error: {
    code: MobileApiErrorCode;
    message: string;
  };
};

type MobileApiEnvelope = {
  apiVersion: "1";
  generatedAt: string;
};

export type MobileMutationResponse = MobileApiEnvelope & {
  success: true;
};

export type MobileBootstrapResponse = MobileApiEnvelope & {
  household: {
    id: string;
    name: string;
    timezone: string;
  };
  currentMember: {
    id: string;
    displayName: string;
    initials: string;
    role: HouseholdRole;
  };
  members: MobileMember[];
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

export type MobileMember = {
  id: string;
  displayName: string;
  initials: string;
  role: HouseholdRole;
};

export type MobileInboxResponse = MobileApiEnvelope & {
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

export type MobileTasksResponse = MobileApiEnvelope & {
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

export type MobileShoppingResponse = MobileApiEnvelope & {
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

export type MobileBillsResponse = MobileApiEnvelope & {
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
  sources: MobileSourceReference[];
};

export type MobileSourcesResponse = MobileApiEnvelope & {
  sources: MobileSourceReference[];
};

export type MobileSourceReference = {
  id: string;
  title: string;
  kind: string;
  label: string;
  url: string | null;
  reviewStatus: string;
  sensitivity: string;
  createdByMemberId: string;
};

export type MobileCommentTarget = {
  entityType: "inbox_item" | "task" | "reminder" | "shopping_list" | "bill_or_renewal" | "source_reference";
  entityId: string;
  label: string;
  group: string;
};

export type MobileActivityResponse = MobileApiEnvelope & {
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
  }>;
  targets: MobileCommentTarget[];
};
