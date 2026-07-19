import { requireEnum, requireId, readJsonObject } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { updateReminderSeriesState } from "@/lib/server/recurrence-series";

export const dynamic = "force-dynamic";

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ seriesId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const action = requireEnum(input, "action", ["pause", "resume", "end"] as const);
    const seriesId = requireId((await params).seriesId);
    await updateReminderSeriesState(context, seriesId, action);
    return { apiVersion: "1" as const, generatedAt: new Date().toISOString(), success: true as const };
  });
}
