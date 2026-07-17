import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/lib/theme";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
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
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack>
    </ClerkProvider>
  );
}
