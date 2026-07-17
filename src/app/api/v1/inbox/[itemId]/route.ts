import { requireBoolean, requireId, readJsonObject } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { setMobileInboxItemArchived } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const archived = requireBoolean(input, "archived");
    const itemId = requireId((await params).itemId);
    return setMobileInboxItemArchived(context, itemId, archived);
  });
}
