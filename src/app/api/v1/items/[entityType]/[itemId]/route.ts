import {
  optionalHttpsUrl,
  optionalId,
  optionalText,
  readJsonObject,
  requireDate,
  requireEnum,
  requireId,
  requireText,
} from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileItemDetail } from "@/lib/server/mobile-item-detail";
import {
  archiveMobileItem,
  updateMobileItem,
  type MobileItemUpdate,
} from "@/lib/server/mobile-item-management";

export const dynamic = "force-dynamic";

const entityTypes = [
  "inbox_item",
  "task",
  "reminder",
  "shopping_list",
  "bill_or_renewal",
  "source_reference",
] as const;

type RouteParams = {
  params: Promise<{ entityType: string; itemId: string }>;
};

export function GET(_request: Request, { params }: RouteParams) {
  return withHouseholdApi(async (context) => {
    const { entityType, itemId } = await readParams(params);
    return getMobileItemDetail(context, entityType, itemId);
  });
}

export function PATCH(request: Request, { params }: RouteParams) {
  return withHouseholdApi(async (context) => {
    const values = await readJsonObject(request);
    const { entityType, itemId } = await readParams(params);

    if (values.archive === true) {
      await archiveMobileItem(context, entityType, itemId);
    } else {
      await updateMobileItem(
        context,
        entityType,
        itemId,
        readUpdate(entityType, values),
      );
    }

    return getMobileItemDetail(context, entityType, itemId);
  });
}

async function readParams(params: RouteParams["params"]) {
  const values = await params;
  return {
    entityType: requireEnum(
      { entityType: values.entityType },
      "entityType",
      entityTypes,
    ),
    itemId: requireId(values.itemId),
  };
}

function readUpdate(
  entityType: (typeof entityTypes)[number],
  input: Record<string, unknown>,
): MobileItemUpdate {
  const title = requireText(input, "title", 1, entityType === "shopping_list" ? 80 : 120);

  switch (entityType) {
    case "inbox_item":
      return {
        title,
        description: optionalText(input, "description", 1_000),
        category: requireEnum(input, "category", [
          "school",
          "appointment",
          "renewal",
          "household_admin",
          "shopping",
          "other",
        ] as const),
        priority: requireEnum(input, "priority", ["low", "normal", "high"] as const),
        destination: requireEnum(input, "destination", [
          "task",
          "reminder",
          "bill_or_renewal",
          "shopping_list",
          "source_reference",
          "none",
        ] as const),
        assignedMemberId: optionalId(input, "assignedMemberId"),
        sourceReferenceId: optionalId(input, "sourceReferenceId"),
      };
    case "task":
      return {
        title,
        description: optionalText(input, "description", 1_000),
        date: requireDate(input, "date"),
        priority: requireEnum(input, "priority", ["low", "normal", "high"] as const),
        assignedMemberId: optionalId(input, "assignedMemberId"),
        sourceReferenceId: optionalId(input, "sourceReferenceId"),
      };
    case "reminder":
      return {
        title,
        description: optionalText(input, "description", 1_000),
        date: requireDate(input, "date"),
        assignedMemberId: optionalId(input, "assignedMemberId"),
      };
    case "shopping_list":
      return { title };
    case "bill_or_renewal":
      return {
        title,
        provider: optionalText(input, "provider", 120),
        date: requireDate(input, "date"),
        assignedMemberId: optionalId(input, "assignedMemberId"),
        sourceReferenceId: optionalId(input, "sourceReferenceId"),
      };
    case "source_reference":
      return {
        title,
        label: requireText(input, "label", 1, 160),
        url: optionalHttpsUrl(input, "url"),
      };
  }
}
