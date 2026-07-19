import { readJsonObject, requireEnum, requireText } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import {
  registerDeviceInstallation,
  unregisterDeviceInstallation,
} from "@/lib/server/notifications";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const body = await readJsonObject(request);
    return registerDeviceInstallation(context, {
      installationKey: requireText(body, "installationKey", 32, 80),
      expoPushToken: requireText(body, "expoPushToken", 20, 240),
      platform: requireEnum(body, "platform", ["ios", "android"] as const),
    });
  });
}

export function DELETE(request: Request) {
  return withHouseholdApi(async (context) => {
    const body = await readJsonObject(request);
    return unregisterDeviceInstallation(
      context,
      requireText(body, "installationKey", 32, 80),
    );
  });
}
