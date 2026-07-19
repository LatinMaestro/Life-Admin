import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { listenForNotificationResponses } from "@/lib/notifications";
import { colors } from "@/lib/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
if (!publishableKey) throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <NotificationNavigation />
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: "Back",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="item-detail" options={{ title: "Details" }} />
        <Stack.Screen name="edit-item" options={{ title: "Edit item", presentation: "modal" }} />
        <Stack.Screen name="edit-shopping-item" options={{ title: "Edit shopping item", presentation: "modal" }} />
        <Stack.Screen name="route-inbox" options={{ title: "Sort inbox item", presentation: "modal" }} />
        <Stack.Screen name="repeat-reminder" options={{ title: "Repeat reminder" }} />
        <Stack.Screen name="edit-occurrence" options={{ title: "Move occurrence", presentation: "modal" }} />
        <Stack.Screen name="bills" options={{ title: "Bills & renewals" }} />
        <Stack.Screen name="family" options={{ title: "Family" }} />
        <Stack.Screen name="sources" options={{ title: "Sources" }} />
        <Stack.Screen name="activity" options={{ title: "Activity" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="notification-settings" options={{ title: "Notifications" }} />
        <Stack.Screen name="new-inbox" options={{ title: "Add to inbox", presentation: "modal" }} />
        <Stack.Screen name="new-task" options={{ title: "Add task", presentation: "modal" }} />
        <Stack.Screen name="new-shopping-item" options={{ title: "Add shopping item", presentation: "modal" }} />
        <Stack.Screen name="new-shopping-list" options={{ title: "New shopping list", presentation: "modal" }} />
        <Stack.Screen name="new-bill" options={{ title: "Add bill or renewal", presentation: "modal" }} />
        <Stack.Screen name="new-source" options={{ title: "Add source", presentation: "modal" }} />
        <Stack.Screen name="new-voice" options={{ title: "Voice note", presentation: "modal" }} />
        <Stack.Screen name="review-drafts" options={{ title: "Review suggestions" }} />
        <Stack.Screen name="new-comment" options={{ title: "Add comment", presentation: "modal" }} />
        <Stack.Screen name="invite-member" options={{ title: "Add family member", presentation: "modal" }} />
        <Stack.Screen name="manage-member" options={{ title: "Manage family member", presentation: "modal" }} />
        <Stack.Screen name="edit-household" options={{ title: "Household details", presentation: "modal" }} />
        <Stack.Screen name="delete-account" options={{ title: "Delete account", presentation: "modal" }} />
      </Stack>
    </ClerkProvider>
  );
}

function NotificationNavigation() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;
    const subscription = listenForNotificationResponses((path) => {
      router.push(path as never);
    });
    return () => subscription.remove();
  }, [isSignedIn, router]);

  return null;
}
