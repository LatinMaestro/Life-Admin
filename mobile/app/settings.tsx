import { useClerk } from "@clerk/expo";
import { Pressable, StyleSheet, Text } from "react-native";

import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource } from "@/lib/api";
import type { BootstrapResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function SettingsScreen() {
  const { signOut } = useClerk();
  const state = useApiResource<BootstrapResponse>("/api/v1/bootstrap");

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Settings" />
      <StatusView {...state} onRetry={() => void state.refresh()} />
      {state.data ? (
        <>
          <Section title="Household">
            <Row title={state.data.household.name} detail={state.data.household.timezone} />
            <Row
              title={state.data.currentMember.displayName}
              detail={state.data.currentMember.role === "household_admin" ? "Household admin" : "Household member"}
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

const styles = StyleSheet.create({
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
