import { useClerk } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource } from "@/lib/api";
import type { BootstrapResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

const webUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const router = useRouter();
  const state = useApiResource<BootstrapResponse>("/api/v1/bootstrap");

  const openWebPage = (path: string) => {
    if (webUrl) void Linking.openURL(`${webUrl}${path}`);
  };

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Settings" />
      <StatusView {...state} onRetry={() => void state.refresh()} />
      {state.data ? (
        <>
          <Section title="Household">
            {state.data.capabilities.canManageHousehold ? (
              <SettingsLink label={state.data.household.name} onPress={() => router.push({ pathname: "/edit-household", params: { name: state.data!.household.name, timezone: state.data!.household.timezone } })} />
            ) : (
              <Row title={state.data.household.name} detail={state.data.household.timezone} />
            )}
            <Row
              title={state.data.currentMember.displayName}
              detail={state.data.currentMember.role === "household_admin" ? "Household admin" : "Household member"}
            />
          </Section>
          <Section title="Help & privacy">
            <SettingsLink label="Privacy policy" onPress={() => openWebPage("/privacy")} />
            <SettingsLink label="Support" onPress={() => openWebPage("/support")} />
            <SettingsLink
              destructive
              label="Delete account"
              onPress={() => router.push("/delete-account")}
            />
          </Section>
          <Pressable accessibilityRole="button" onPress={() => void signOut()} style={styles.signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </>
      ) : null}
    </Screen>
  );
}

function SettingsLink({
  destructive = false,
  label,
  onPress,
}: {
  destructive?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.link}>
      <Text style={[styles.linkText, destructive && styles.destructive]}>{label}</Text>
      <Ionicons color={destructive ? colors.danger : colors.muted} name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: 16,
  },
  linkText: { color: colors.text, flex: 1, fontSize: 15, fontWeight: "600" },
  destructive: { color: colors.danger },
  signOut: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: "center",
  },
  signOutText: { color: colors.text, fontSize: 16, fontWeight: "700" },
});
