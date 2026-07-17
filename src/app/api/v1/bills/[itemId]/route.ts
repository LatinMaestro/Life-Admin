import { requireBoolean, requireId, readJsonObject } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { setMobileBillCompleted } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const completed = requireBoolean(input, "completed");
    const itemId = requireId((await params).itemId);
    return setMobileBillCompleted(context, itemId, completed);
  });
}
