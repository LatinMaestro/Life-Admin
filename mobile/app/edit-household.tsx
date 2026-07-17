import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useHouseholdMutation } from "@/lib/api";
import { colors } from "@/lib/theme";

const timezones = [
  "Australia/Brisbane",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Adelaide",
  "Australia/Perth",
  "Australia/Darwin",
  "Australia/Hobart",
] as const;

export default function EditHouseholdScreen() {
  const params = useLocalSearchParams<{ name: string; timezone: string }>();
  const router = useRouter();
  const mutate = useHouseholdMutation();
  const [name, setName] = useState(params.name ?? "");
  const [timezone, setTimezone] = useState(params.timezone ?? "Australia/Brisbane");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate("/api/v1/household", { name, timezone });
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
        <Text style={styles.label}>Household name</Text>
        <TextInput
          accessibilityLabel="Household name"
          autoFocus
          maxLength={80}
          onChangeText={setName}
          style={styles.input}
          value={name}
        />
        <Text style={styles.label}>Timezone</Text>
        {timezones.map((item) => {
          const selected = timezone === item;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={item}
              onPress={() => setTimezone(item)}
              style={[styles.timezone, selected && styles.selected]}
            >
              <Text style={styles.timezoneText}>{item.replace("Australia/", "")}</Text>
            </Pressable>
          );
        })}
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton busy={busy} icon="checkmark" label="Save household" onPress={() => void submit()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 10, padding: 18 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 4 },
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
  timezone: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  selected: { backgroundColor: "#EDF6F1", borderColor: colors.primary },
  timezoneText: { color: colors.text, fontSize: 15, fontWeight: "600" },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
