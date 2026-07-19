import { requireEnum, requireId, requireText, readJsonObject } from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import {
  rescheduleReminderOccurrence,
  skipReminderOccurrence,
} from "@/lib/server/recurrence-series";

export const dynamic = "force-dynamic";

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ occurrenceId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const action = requireEnum(input, "action", ["skip", "reschedule"] as const);
    const occurrenceId = requireId((await params).occurrenceId);
    if (action === "skip") {
      await skipReminderOccurrence(context, occurrenceId);
    } else {
      const localDate = requireText(input, "localDate", 10, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
        throw new MobileApiRequestError("Choose a valid occurrence date.");
      }
      await rescheduleReminderOccurrence(context, occurrenceId, localDate);
    }
    return { apiVersion: "1" as const, generatedAt: new Date().toISOString(), success: true as const };
  });
}
