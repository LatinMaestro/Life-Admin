import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useHouseholdMutation } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function DeleteAccountScreen() {
  const { signOut } = useClerk();
  const router = useRouter();
  const mutate = useHouseholdMutation();
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate("/api/account", { confirmation }, "DELETE");
      await signOut().catch(() => undefined);
      router.replace("/(auth)/sign-in");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>This cannot be undone</Text>
        <Text style={styles.body}>
          Your sign-in will be removed and your personal household profile will be anonymized.
          Shared household history may remain under a former-member label.
        </Text>
        <Text style={styles.body}>
          If you are the only household admin, make another member an admin first.
        </Text>
        <Text style={styles.label}>Type DELETE to confirm</Text>
        <TextInput
          accessibilityLabel="Type DELETE to confirm"
          autoCapitalize="characters"
          autoComplete="off"
          onChangeText={setConfirmation}
          style={styles.input}
          value={confirmation}
        />
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          icon="checkmark"
          label="Permanently delete account"
          onPress={() => void remove()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 14, padding: 18 },
  title: { color: colors.danger, fontSize: 22, fontWeight: "700" },
  body: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700", marginTop: 8 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 17,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
