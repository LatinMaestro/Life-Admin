import { readJsonObject, requireEnum, requireText } from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import {
  householdTimezones,
  HouseholdSettingsError,
  updateHouseholdProfile,
} from "@/lib/server/household-settings";

export function PATCH(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const name = requireText(input, "name", 2, 80);
    const timezone = requireEnum(input, "timezone", householdTimezones);
    try {
      await updateHouseholdProfile(context, name, timezone);
    } catch (error) {
      if (error instanceof HouseholdSettingsError) {
        throw new MobileApiRequestError(error.message);
      }
      throw error;
    }
    return { apiVersion: "1" as const, generatedAt: new Date().toISOString(), success: true as const };
  });
}
