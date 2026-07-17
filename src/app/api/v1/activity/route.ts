import { readJsonObject, requireEnum, requireId, requireText } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileActivity } from "@/lib/server/mobile-module-reads";
import { createMobileComment } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

const commentTargetTypes = [
  "inbox_item",
  "task",
  "reminder",
  "shopping_list",
  "bill_or_renewal",
  "source_reference",
] as const;

export function GET() {
  return withHouseholdApi(getMobileActivity);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const entityType = requireEnum(input, "entityType", commentTargetTypes);
    const entityId = requireId(typeof input.entityId === "string" ? input.entityId : undefined);
    const body = requireText(input, "body", 1, 500);
    return createMobileComment(context, { entityType, entityId, body });
  });
}
