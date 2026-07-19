import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const INSTALLATION_KEY = "family-life-admin-installation-key";

type Mutate = (
  path: `/api/${string}`,
  body: Record<string, unknown>,
  method?: "PATCH" | "POST" | "DELETE",
) => Promise<{ success: true }>;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function getInstallationKey() {
  const existing = await SecureStore.getItemAsync(INSTALLATION_KEY);
  if (existing) return existing;
  const created = Crypto.randomUUID();
  await SecureStore.setItemAsync(INSTALLATION_KEY, created);
  return created;
}

export async function enablePushNotifications(mutate: Mutate) {
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted
    ? current
    : await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Notifications were not enabled. You can allow them later in device settings.");
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("household-reminders", {
      name: "Household reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      vibrationPattern: [0, 250],
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
    ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error("Push notifications are not configured for this build.");

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await mutate("/api/v1/notifications/installations", {
    installationKey: await getInstallationKey(),
    expoPushToken: token.data,
    platform: Platform.OS,
  }, "POST");
}

export async function disablePushNotifications(mutate: Mutate) {
  const installationKey = await SecureStore.getItemAsync(INSTALLATION_KEY);
  if (installationKey) {
    await mutate("/api/v1/notifications/installations", { installationKey }, "DELETE");
  }
  await mutate("/api/v1/notifications/preferences", { enabled: false }, "PATCH");
}

export function listenForNotificationResponses(onPath: (path: string) => void) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const path = response.notification.request.content.data?.path;
    if (typeof path === "string" && ["/tasks", "/bills", "/inbox"].includes(path)) {
      onPath(path);
    }
  });
}
