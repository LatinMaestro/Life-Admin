import { requireBoolean, requireEnum, requireId, readJsonObject } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { setMobileWorkCompleted } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const completed = requireBoolean(input, "completed");
    const entityType = requireEnum(input, "entityType", ["task", "reminder"] as const);
    const itemId = requireId((await params).itemId);
    return setMobileWorkCompleted(context, itemId, entityType, completed);
  });
}
