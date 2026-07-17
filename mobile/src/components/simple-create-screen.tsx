import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useHouseholdMutation } from "@/lib/api";
import { colors } from "@/lib/theme";

export function SimpleCreateScreen({
  endpoint,
  noteField,
  notePlaceholder,
  submitLabel,
  titlePlaceholder,
}: {
  endpoint: "/api/v1/inbox" | "/api/v1/tasks";
  noteField: "description" | "notes";
  notePlaceholder: string;
  submitLabel: string;
  titlePlaceholder: string;
}) {
  const router = useRouter();
  const mutate = useHouseholdMutation();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate(endpoint, { title, [noteField]: note }, "POST");
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>What needs attention?</Text>
        <TextInput
          accessibilityLabel={titlePlaceholder}
          autoFocus
          maxLength={120}
          onChangeText={setTitle}
          placeholder={titlePlaceholder}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={title}
        />
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          accessibilityLabel="Optional notes"
          maxLength={1000}
          multiline
          onChangeText={setNote}
          placeholder={notePlaceholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.notes]}
          textAlignVertical="top"
          value={note}
        />
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          icon="checkmark"
          label={submitLabel}
          onPress={() => void submit()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  form: { gap: 12, padding: 18 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    padding: 14,
  },
  notes: { minHeight: 112 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
