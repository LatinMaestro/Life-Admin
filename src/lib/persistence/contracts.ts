import type { HouseholdAccessContext } from "@/lib/access-control";

export interface HouseholdRecord {
  id: string;
  householdId: string;
}

export interface MemberOwnedRecord extends HouseholdRecord {
  assignedMemberId?: string | null;
  createdByMemberId: string;
}

export interface HouseholdSummary extends HouseholdRecord {
  name: string;
  timezone: string;
}

export interface HouseholdMemberSummary extends HouseholdRecord {
  displayName: string;
  role: "household_admin" | "household_member";
  status: "active" | "inactive";
  initials?: string | null;
}

export interface InboxItemSummary extends MemberOwnedRecord {
  title: string;
  description?: string | null;
  status: string;
  category: string;
  priority: string;
  sourceReferenceId?: string | null;
}

export interface TaskSummary extends MemberOwnedRecord {
  title: string;
  notes?: string | null;
  status: string;
  stage: string;
  priority: string;
  dueAt?: Date | null;
  sourceReferenceId?: string | null;
}

export interface ReminderSummary extends MemberOwnedRecord {
  title: string;
  notes?: string | null;
  status: string;
  cadence: string;
  remindAt?: Date | null;
}

export interface ShoppingListSummary extends HouseholdRecord {
  name: string;
  status: string;
  createdByMemberId: string;
  openItemCount: number;
  totalItemCount: number;
}

export interface BillOrRenewalSummary extends MemberOwnedRecord {
  title: string;
  provider?: string | null;
  type: "bill" | "renewal";
  status: string;
  dueAt?: Date | null;
  renewalAt?: Date | null;
  sourceReferenceId?: string | null;
}

export interface SourceReferenceSummary extends HouseholdRecord {
  title: string;
  kind: string;
  label: string;
  reviewStatus: string;
  sensitivity: string;
  createdByMemberId: string;
}

export interface CommentSummary extends HouseholdRecord {
  entityType: string;
  entityId: string;
  body: string;
  createdByMemberId: string;
  createdAt: Date;
}

export interface ActivityEventSummary extends HouseholdRecord {
  entityType: string;
  entityId?: string | null;
  eventType: string;
  summary: string;
  actorMemberId?: string | null;
  createdAt: Date;
}

export interface HouseholdWorkspaceRepository {
  getHousehold(context: HouseholdAccessContext): Promise<HouseholdSummary>;
  listMembers(context: HouseholdAccessContext): Promise<HouseholdMemberSummary[]>;
}

export interface HouseholdDashboardRepository {
  listInboxItems(context: HouseholdAccessContext): Promise<InboxItemSummary[]>;
  listTasks(context: HouseholdAccessContext): Promise<TaskSummary[]>;
  listReminders(context: HouseholdAccessContext): Promise<ReminderSummary[]>;
  listShoppingLists(context: HouseholdAccessContext): Promise<ShoppingListSummary[]>;
  listBillsAndRenewals(context: HouseholdAccessContext): Promise<BillOrRenewalSummary[]>;
  listSourceReferences(context: HouseholdAccessContext): Promise<SourceReferenceSummary[]>;
  listComments(context: HouseholdAccessContext): Promise<CommentSummary[]>;
  listActivity(context: HouseholdAccessContext): Promise<ActivityEventSummary[]>;
}

export interface HouseholdPersistenceAdapter extends HouseholdWorkspaceRepository, HouseholdDashboardRepository {}
