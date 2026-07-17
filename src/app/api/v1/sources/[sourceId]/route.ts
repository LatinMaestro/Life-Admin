import { requireEnum, requireId, readJsonObject } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { setMobileSourceReviewStatus } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ sourceId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const status = requireEnum(
      input,
      "status",
      ["needs_review", "confirmed", "archived"] as const,
    );
    const sourceId = requireId((await params).sourceId);
    return setMobileSourceReviewStatus(context, sourceId, status);
  });
}
