import { requireEnum, requireId } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileItemDetail } from "@/lib/server/mobile-item-detail";

export const dynamic = "force-dynamic";

const entityTypes = [
  "inbox_item",
  "task",
  "reminder",
  "shopping_list",
  "bill_or_renewal",
  "source_reference",
] as const;

export function GET(
  _request: Request,
  {
    params,
  }: { params: Promise<{ entityType: string; itemId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const values = await params;
    const entityType = requireEnum(
      { entityType: values.entityType },
      "entityType",
      entityTypes,
    );
    const itemId = requireId(values.itemId);
    return getMobileItemDetail(context, entityType, itemId);
  });
}
