import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useHouseholdMutation } from "@/lib/api";
import type { HouseholdRole } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function ManageMemberScreen() {
  const params = useLocalSearchParams<{ memberId: string; name: string; role: HouseholdRole }>();
  const router = useRouter();
  const mutate = useHouseholdMutation();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const nextRole: HouseholdRole =
    params.role === "household_admin" ? "household_member" : "household_admin";

  const changeRole = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate(`/api/v1/family/members/${params.memberId}`, {
        operation: "role",
        role: nextRole,
      });
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirmRemove = () => {
    Alert.alert(
      "Remove household access?",
      `${params.name} will no longer be able to open this household.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => void remove(),
        },
      ],
    );
  };

  const remove = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate(`/api/v1/family/members/${params.memberId}`, { operation: "remove" });
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{params.name}</Text>
        <Text style={styles.role}>
          {params.role === "household_admin" ? "Household admin" : "Household member"}
        </Text>
        <Text style={styles.help}>
          Admins can manage household details, invitations, and member access. Members can use all shared household items.
        </Text>
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          icon="checkmark"
          label={nextRole === "household_admin" ? "Make admin" : "Make member"}
          onPress={() => void changeRole()}
        />
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={confirmRemove}
          style={styles.removeButton}
        >
          <Text style={styles.removeText}>Remove from household</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 14, padding: 18 },
  name: { color: colors.text, fontSize: 22, fontWeight: "700" },
  role: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  help: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  removeButton: {
    alignItems: "center",
    borderColor: colors.danger,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  removeText: { color: colors.danger, fontSize: 15, fontWeight: "700" },
});
