import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import type {
  MobileItemDetailResponse,
  MobileItemEntityType,
} from "@/lib/api/v1/contracts";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";

export async function getMobileItemDetail(
  context: HouseholdAccessContext,
  entityType: MobileItemEntityType,
  itemId: string,
): Promise<MobileItemDetailResponse> {
  const adapter = await getHouseholdPersistenceAdapter();
  const [members, comments, events] = await Promise.all([
    adapter.listMembers(context),
    adapter.listComments(context),
    adapter.listActivity(context),
  ]);
  const memberNames = new Map(members.map((member) => [member.id, member.displayName]));
  const item = await getItem(context, entityType, itemId);

  return {
    apiVersion: "1",
    generatedAt: new Date().toISOString(),
    item: {
      ...item,
      assignedTo: item.assignedMemberId
        ? memberNames.get(item.assignedMemberId) ?? null
        : null,
    },
    comments: comments
      .filter(
        (comment) =>
          comment.entityType === entityType && comment.entityId === itemId,
      )
      .map((comment) => ({
        id: comment.id,
        body: comment.body,
        author: memberNames.get(comment.createdByMemberId) ?? "Household member",
        createdAt: comment.createdAt.toISOString(),
      })),
    activity: events
      .filter(
        (event) =>
          event.entityType === entityType && event.entityId === itemId,
      )
      .map((event) => ({
        id: event.id,
        summary: event.summary,
        createdAt: event.createdAt.toISOString(),
      })),
  };

  async function getItem(
    access: HouseholdAccessContext,
    type: MobileItemEntityType,
    id: string,
  ): Promise<MobileItemDetailResponse["item"] & { assignedMemberId: string | null }> {
    switch (type) {
      case "inbox_item": {
        const entry = (await adapter.listInboxItems(access)).find((value) => value.id === id);
        if (!entry) throw new Error("The inbox item is not available.");
        return {
          entityType: type,
          id: entry.id,
          title: entry.title,
          description: entry.description ?? null,
          status: entry.status,
          assignedMemberId: entry.assignedMemberId ?? null,
          assignedTo: null,
          details: [
            { label: "Category", value: formatLabel(entry.category) },
            { label: "Priority", value: formatLabel(entry.priority) },
          ],
          source: await findSource(access, entry.sourceReferenceId),
        };
      }
      case "task": {
        const entry = (await adapter.listTasks(access)).find((value) => value.id === id);
        if (!entry) throw new Error("The task is not available.");
        return {
          entityType: type,
          id: entry.id,
          title: entry.title,
          description: entry.notes ?? null,
          status: entry.status,
          assignedMemberId: entry.assignedMemberId ?? null,
          assignedTo: null,
          details: [
            { label: "Due", value: toIso(entry.dueAt) },
            { label: "Priority", value: formatLabel(entry.priority) },
            { label: "Stage", value: formatLabel(entry.stage) },
          ],
          source: await findSource(access, entry.sourceReferenceId),
        };
      }
      case "reminder": {
        const entry = (await adapter.listReminders(access)).find((value) => value.id === id);
        if (!entry) throw new Error("The reminder is not available.");
        return {
          entityType: type,
          id: entry.id,
          title: entry.title,
          description: entry.notes ?? null,
          status: entry.status,
          assignedMemberId: entry.assignedMemberId ?? null,
          assignedTo: null,
          details: [
            { label: "Remind", value: toIso(entry.remindAt) },
            { label: "Repeats", value: formatLabel(entry.cadence) },
          ],
          source: null,
        };
      }
      case "shopping_list": {
        const entry = (await adapter.listShoppingLists(access)).find((value) => value.id === id);
        if (!entry) throw new Error("The shopping list is not available.");
        return {
          entityType: type,
          id: entry.id,
          title: entry.name,
          description: null,
          status: entry.status,
          assignedMemberId: null,
          assignedTo: null,
          details: [
            { label: "Still needed", value: String(entry.openItemCount) },
            { label: "Items", value: String(entry.totalItemCount) },
          ],
          source: null,
        };
      }
      case "bill_or_renewal": {
        const entry = (await adapter.listBillsAndRenewals(access)).find((value) => value.id === id);
        if (!entry) throw new Error("The bill or renewal is not available.");
        return {
          entityType: type,
          id: entry.id,
          title: entry.title,
          description: entry.provider ?? null,
          status: entry.status,
          assignedMemberId: entry.assignedMemberId ?? null,
          assignedTo: null,
          details: [
            { label: "Type", value: entry.type === "bill" ? "Bill reminder" : "Renewal reminder" },
            {
              label: entry.type === "bill" ? "Due" : "Renews",
              value: toIso(entry.type === "bill" ? entry.dueAt : entry.renewalAt),
            },
          ],
          source: await findSource(access, entry.sourceReferenceId),
        };
      }
      case "source_reference": {
        const entry = (await adapter.listSourceReferences(access)).find((value) => value.id === id);
        if (!entry) throw new Error("The source reference is not available.");
        return {
          entityType: type,
          id: entry.id,
          title: entry.title,
          description: entry.label,
          status: entry.reviewStatus,
          assignedMemberId: null,
          assignedTo: null,
          details: [
            { label: "Kind", value: formatLabel(entry.kind) },
            { label: "Sensitivity", value: formatLabel(entry.sensitivity) },
          ],
          source: {
            label: entry.label,
            url: safeUrl(entry.url),
          },
        };
      }
    }
  }

  async function findSource(
    access: HouseholdAccessContext,
    sourceId: string | null | undefined,
  ) {
    if (!sourceId) return null;
    const source = (await adapter.listSourceReferences(access)).find(
      (entry) => entry.id === sourceId,
    );
    return source
      ? { label: source.label, url: safeUrl(source.url) }
      : null;
  }
}

function toIso(value: Date | null | undefined) {
  return value?.toISOString() ?? null;
}

function safeUrl(value: string | null | undefined) {
  return value?.startsWith("https://") ? value : null;
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/^./, (character) => character.toUpperCase());
}
