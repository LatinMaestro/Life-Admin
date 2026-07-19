import { readJsonObject } from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type PreferenceInput,
} from "@/lib/server/notifications";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getNotificationPreferences);
}

export function PATCH(request: Request) {
  return withHouseholdApi(async (context) => {
    const body = await readJsonObject(request);
    const input = {} as Record<string, boolean | string>;
    for (const field of [
      "enabled",
      "tasksEnabled",
      "remindersEnabled",
      "billsEnabled",
      "renewalsEnabled",
      "intakeEnabled",
      "showPreview",
    ]) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "boolean") throw new MobileApiRequestError("Choose a valid notification setting.");
        input[field] = body[field];
      }
    }
    for (const field of ["quietStart", "quietEnd"]) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== "string") throw new MobileApiRequestError("Choose valid quiet hours.");
        input[field] = body[field];
      }
    }
    return updateNotificationPreferences(context, input as PreferenceInput);
  });
}
