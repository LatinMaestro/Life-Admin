import { requireBoolean, requireId, readJsonObject } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { setMobileShoppingItemChecked } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const checked = requireBoolean(input, "checked");
    const itemId = requireId((await params).itemId);
    return setMobileShoppingItemChecked(context, itemId, checked);
  });
}
