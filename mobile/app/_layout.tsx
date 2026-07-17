import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/lib/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
if (!publishableKey) throw new Error("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is required.");

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
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
        <Stack.Screen name="bills" options={{ title: "Bills & renewals" }} />
        <Stack.Screen name="family" options={{ title: "Family" }} />
        <Stack.Screen name="sources" options={{ title: "Sources" }} />
        <Stack.Screen name="activity" options={{ title: "Activity" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />\n        <Stack.Screen name="new-inbox" options={{ title: "Add to inbox", presentation: "modal" }} />\n        <Stack.Screen name="new-task" options={{ title: "Add task", presentation: "modal" }} />\n        <Stack.Screen name="new-shopping-item" options={{ title: "Add shopping item", presentation: "modal" }} />
        <Stack.Screen name="new-bill" options={{ title: "Add bill or renewal", presentation: "modal" }} />
        <Stack.Screen name="new-source" options={{ title: "Add source", presentation: "modal" }} />
        <Stack.Screen name="delete-account" options={{ title: "Delete account", presentation: "modal" }} />
      </Stack>
    </ClerkProvider>
  );
}
