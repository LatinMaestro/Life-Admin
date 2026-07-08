import { getCurrentHousehold, memberIds } from "@/lib/household";

export type CommentEntityType = "task" | "bill" | "shopping_list" | "inbox_item" | "source_reference";
export type CommentStatus = "Open" | "Acknowledged";

interface HouseholdScopedRecord {
  id: string;
  householdId: string;
}

export interface HouseholdComment extends HouseholdScopedRecord {
  entityType: CommentEntityType;
  entityTitle: string;
  entityHref: string;
  body: string;
  status: CommentStatus;
  visibility: "Household";
  createdByMemberId: string;
  createdAtLabel: string;
}

const household = getCurrentHousehold();

const comments: HouseholdComment[] = [
  {
    id: "comment_sports_bag",
    householdId: household.id,
    entityType: "task",
    entityTitle: "Prepare sports bag",
    entityHref: "/tasks",
    body: "Shoes are by the front door. I added the water bottle to the bag.",
    status: "Open",
    visibility: "Household",
    createdByMemberId: memberIds.morgan,
    createdAtLabel: "Today",
  },
  {
    id: "comment_home_insurance",
    householdId: household.id,
    entityType: "bill",
    entityTitle: "Home insurance renewal",
    entityHref: "/bills",
    body: "Provider portal reference is saved; review the renewal notice before taking action.",
    status: "Open",
    visibility: "Household",
    createdByMemberId: memberIds.alex,
    createdAtLabel: "Yesterday",
  },
  {
    id: "comment_groceries",
    householdId: household.id,
    entityType: "shopping_list",
    entityTitle: "Groceries",
    entityHref: "/lists",
    body: "Bread is already picked up. Milk and lunchbox fruit are still open.",
    status: "Acknowledged",
    visibility: "Household",
    createdByMemberId: memberIds.taylor,
    createdAtLabel: "Yesterday",
  },
  {
    id: "comment_source_notice",
    householdId: household.id,
    entityType: "source_reference",
    entityTitle: "Council rates notice",
    entityHref: "/sources",
    body: "Keep this as a source reference only; open the original notice before household action.",
    status: "Acknowledged",
    visibility: "Household",
    createdByMemberId: memberIds.alex,
    createdAtLabel: "This week",
  },
];

function forCurrentHousehold<T extends HouseholdScopedRecord>(records: T[]) {
  return records.filter((record) => record.householdId === household.id);
}

export function getCurrentHouseholdComments() {
  return forCurrentHousehold(comments);
}

export function getCurrentHouseholdOpenComments() {
  return getCurrentHouseholdComments().filter((comment) => comment.status === "Open");
}

export function getCommentsForEntityType(entityType: CommentEntityType) {
  return getCurrentHouseholdComments().filter((comment) => comment.entityType === entityType);
}

export function getCommentEntityLabel(entityType: CommentEntityType) {
  const labels: Record<CommentEntityType, string> = {
    task: "Task",
    bill: "Bill or renewal",
    shopping_list: "Shopping list",
    inbox_item: "Inbox item",
    source_reference: "Source reference",
  };

  return labels[entityType];
}
