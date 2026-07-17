import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useHouseholdMutation } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function NewSourceScreen() {
  const router = useRouter();
  const mutate = useHouseholdMutation();
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate("/api/v1/sources", { title, label, url }, "POST");
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
        <Text style={styles.label}>Source name</Text>
        <TextInput
          accessibilityLabel="Source name"
          autoFocus
          maxLength={120}
          onChangeText={setTitle}
          placeholder="For example: Electricity notice"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={title}
        />
        <Text style={styles.label}>Where to find it</Text>
        <TextInput
          accessibilityLabel="Source location"
          maxLength={160}
          onChangeText={setLabel}
          placeholder="For example: Provider portal or kitchen folder"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={label}
        />
        <Text style={styles.label}>HTTPS link (optional)</Text>
        <TextInput
          accessibilityLabel="HTTPS source link"
          autoCapitalize="none"
          keyboardType="url"
          maxLength={2000}
          onChangeText={setUrl}
          placeholder="https://"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={url}
        />
        <Text style={styles.help}>Use a link or location reference only. Do not copy payment details.</Text>
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          icon="checkmark"
          label="Add source"
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
  help: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
