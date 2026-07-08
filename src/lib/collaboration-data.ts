import { getCurrentHousehold, memberIds } from "@/lib/household";

export type CommentEntityType = "task" | "bill" | "shopping_list" | "inbox_item" | "source_reference";

interface HouseholdScopedRecord {
  id: string;
  householdId: string;
}

export interface HouseholdComment extends HouseholdScopedRecord {
  entityType: CommentEntityType;
  entityTitle: string;
  body: string;
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
    body: "Shoes are by the front door. I added the water bottle to the bag.",
    createdByMemberId: memberIds.morgan,
    createdAtLabel: "Today",
  },
  {
    id: "comment_home_insurance",
    householdId: household.id,
    entityType: "bill",
    entityTitle: "Home insurance renewal",
    body: "Provider portal reference is saved; review the renewal notice before taking action.",
    createdByMemberId: memberIds.alex,
    createdAtLabel: "Yesterday",
  },
  {
    id: "comment_groceries",
    householdId: household.id,
    entityType: "shopping_list",
    entityTitle: "Groceries",
    body: "Bread is already picked up. Milk and lunchbox fruit are still open.",
    createdByMemberId: memberIds.taylor,
    createdAtLabel: "Yesterday",
  },
];

function forCurrentHousehold<T extends HouseholdScopedRecord>(records: T[]) {
  return records.filter((record) => record.householdId === household.id);
}

export function getCurrentHouseholdComments() {
  return forCurrentHousehold(comments);
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
