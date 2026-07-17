import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/expo";
import { Redirect, Tabs } from "expo-router";

import { colors } from "@/lib/theme";

const icons = {
  index: ["home-outline", "home"],
  inbox: ["file-tray-outline", "file-tray"],
  tasks: ["checkmark-circle-outline", "checkmark-circle"],
  shopping: ["cart-outline", "cart"],
  more: ["ellipsis-horizontal-circle-outline", "ellipsis-horizontal-circle"],
} as const;

export default function TabLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 66,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ color, focused, size }) => {
          const pair = icons[route.name as keyof typeof icons] ?? icons.more;
          return <Ionicons color={color} name={focused ? pair[1] : pair[0]} size={size} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="inbox" options={{ title: "Inbox" }} />
      <Tabs.Screen name="tasks" options={{ title: "Tasks" }} />
      <Tabs.Screen name="shopping" options={{ title: "Shopping" }} />
      <Tabs.Screen name="more" options={{ title: "More" }} />
    </Tabs>
  );
}
