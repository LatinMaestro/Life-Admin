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

export interface CreateInboxItemInput {
  title: string;
  description?: string | null;
  category: "school" | "appointment" | "renewal" | "household_admin" | "shopping" | "other";
  priority: "low" | "normal" | "high";
  suggestedDestination:
    | "task"
    | "reminder"
    | "bill_or_renewal"
    | "shopping_list"
    | "source_reference"
    | "none";
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

export interface CreateTaskInput {
  title: string;
  notes?: string | null;
  priority: "low" | "normal" | "high";
  dueAt?: Date | null;
  assignedMemberId?: string | null;
}

export interface ReminderSummary extends MemberOwnedRecord {
  title: string;
  notes?: string | null;
  status: string;
  cadence: string;
  remindAt?: Date | null;
}

export interface CreateReminderInput {
  title: string;
  notes?: string | null;
  cadence: "once" | "weekly" | "monthly" | "custom";
  remindAt?: Date | null;
  assignedMemberId?: string | null;
}

export interface ShoppingListSummary extends HouseholdRecord {
  name: string;
  status: string;
  createdByMemberId: string;
  openItemCount: number;
  totalItemCount: number;
}

export interface ShoppingListItemSummary extends MemberOwnedRecord {
  shoppingListId: string;
  label: string;
  notes?: string | null;
  quantity?: string | null;
  category?: string | null;
  checked: boolean;
}

export interface CreateShoppingListInput {
  name: string;
}

export interface CreateShoppingListItemInput {
  shoppingListId: string;
  label: string;
  notes?: string | null;
  quantity?: string | null;
  category?: string | null;
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

export interface CreateBillOrRenewalInput {
  title: string;
  provider?: string | null;
  type: "bill" | "renewal";
  dueAt?: Date | null;
  renewalAt?: Date | null;
  notes?: string | null;
  sourceReferenceId?: string | null;
  assignedMemberId?: string | null;
}

export interface SourceReferenceSummary extends HouseholdRecord {
  title: string;
  kind: string;
  label: string;
  url?: string | null;
  reviewStatus: string;
  sensitivity: string;
  createdByMemberId: string;
}

export interface CreateSourceReferenceInput {
  title: string;
  kind:
    | "source_link"
    | "source_document_reference"
    | "source_image_reference"
    | "source_email_reference"
    | "source_crop_reference";
  label: string;
  url?: string | null;
}

export interface CommentSummary extends HouseholdRecord {
  entityType: string;
  entityId: string;
  body: string;
  createdByMemberId: string;
  createdAt: Date;
}

export interface CreateCommentInput {
  entityType:
    | "inbox_item"
    | "task"
    | "reminder"
    | "shopping_list"
    | "bill_or_renewal"
    | "source_reference";
  entityId: string;
  body: string;
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
  createInboxItem(
    context: HouseholdAccessContext,
    input: CreateInboxItemInput,
  ): Promise<InboxItemSummary>;
  setInboxItemArchived(
    context: HouseholdAccessContext,
    itemId: string,
    archived: boolean,
  ): Promise<InboxItemSummary>;
  listTasks(context: HouseholdAccessContext): Promise<TaskSummary[]>;
  createTask(context: HouseholdAccessContext, input: CreateTaskInput): Promise<TaskSummary>;
  setTaskCompleted(
    context: HouseholdAccessContext,
    taskId: string,
    completed: boolean,
  ): Promise<TaskSummary>;
  listReminders(context: HouseholdAccessContext): Promise<ReminderSummary[]>;
  createReminder(
    context: HouseholdAccessContext,
    input: CreateReminderInput,
  ): Promise<ReminderSummary>;
  setReminderCompleted(
    context: HouseholdAccessContext,
    reminderId: string,
    completed: boolean,
  ): Promise<ReminderSummary>;
  listShoppingLists(context: HouseholdAccessContext): Promise<ShoppingListSummary[]>;
  listShoppingListItems(context: HouseholdAccessContext): Promise<ShoppingListItemSummary[]>;
  createShoppingList(
    context: HouseholdAccessContext,
    input: CreateShoppingListInput,
  ): Promise<ShoppingListSummary>;
  setShoppingListArchived(
    context: HouseholdAccessContext,
    listId: string,
    archived: boolean,
  ): Promise<ShoppingListSummary>;
  createShoppingListItem(
    context: HouseholdAccessContext,
    input: CreateShoppingListItemInput,
  ): Promise<ShoppingListItemSummary>;
  setShoppingListItemChecked(
    context: HouseholdAccessContext,
    itemId: string,
    checked: boolean,
  ): Promise<ShoppingListItemSummary>;
  listBillsAndRenewals(context: HouseholdAccessContext): Promise<BillOrRenewalSummary[]>;
  createBillOrRenewal(
    context: HouseholdAccessContext,
    input: CreateBillOrRenewalInput,
  ): Promise<BillOrRenewalSummary>;
  setBillOrRenewalCompleted(
    context: HouseholdAccessContext,
    itemId: string,
    completed: boolean,
  ): Promise<BillOrRenewalSummary>;
  listSourceReferences(context: HouseholdAccessContext): Promise<SourceReferenceSummary[]>;
  createSourceReference(
    context: HouseholdAccessContext,
    input: CreateSourceReferenceInput,
  ): Promise<SourceReferenceSummary>;
  setSourceReferenceReviewStatus(
    context: HouseholdAccessContext,
    sourceId: string,
    status: "needs_review" | "confirmed" | "archived",
  ): Promise<SourceReferenceSummary>;
  listComments(context: HouseholdAccessContext): Promise<CommentSummary[]>;
  createComment(
    context: HouseholdAccessContext,
    input: CreateCommentInput,
  ): Promise<CommentSummary>;
  listActivity(context: HouseholdAccessContext): Promise<ActivityEventSummary[]>;
}

export interface HouseholdPersistenceAdapter
  extends HouseholdWorkspaceRepository,
    HouseholdDashboardRepository {}
