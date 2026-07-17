import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useHouseholdMutation } from "@/lib/api";
import type { HouseholdRole } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function InviteMemberScreen() {
  const router = useRouter();
  const mutate = useHouseholdMutation();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<HouseholdRole>("household_member");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate("/api/v1/family", { email, role }, "POST");
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Email address</Text>
        <TextInput
          accessibilityLabel="Email address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
          keyboardType="email-address"
          maxLength={254}
          onChangeText={setEmail}
          placeholder="name@example.com"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={email}
        />
        <Text style={styles.label}>Access</Text>
        <View accessibilityRole="radiogroup" style={styles.options}>
          <RoleOption
            label="Member"
            detail="Can use shared household items"
            selected={role === "household_member"}
            onPress={() => setRole("household_member")}
          />
          <RoleOption
            label="Admin"
            detail="Can also manage people and settings"
            selected={role === "household_admin"}
            onPress={() => setRole("household_admin")}
          />
        </View>
        <Text style={styles.help}>The invitation lasts 14 days and can be cancelled from Family.</Text>
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          disabled={!email.trim()}
          icon="checkmark"
          label="Create invitation"
          onPress={() => void submit()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function RoleOption({
  detail,
  label,
  onPress,
  selected,
}: {
  detail: string;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.selected]}
    >
      <Text style={styles.optionTitle}>{label}</Text>
      <Text style={styles.optionDetail}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 14, padding: 18 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  options: { flexDirection: "row", gap: 10 },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 82,
    padding: 12,
  },
  selected: { backgroundColor: "#EDF6F1", borderColor: colors.primary },
  optionTitle: { color: colors.text, fontSize: 15, fontWeight: "700" },
  optionDetail: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  help: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
