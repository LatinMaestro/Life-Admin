import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateField } from "@/components/date-field";
import { PrimaryButton } from "@/components/primary-button";
import { StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { BillsResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function NewBillScreen() {
  const router = useRouter();
  const state = useApiResource<BillsResponse>("/api/v1/bills");
  const mutate = useHouseholdMutation();
  const [type, setType] = useState<"bill" | "renewal">("bill");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [date, setDate] = useState(() => {
    const value = new Date();
    value.setDate(value.getDate() + 7);
    return value;
  });
  const [sourceReferenceId, setSourceReferenceId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate(
        "/api/v1/bills",
        {
          title,
          provider,
          type,
          date: date.toISOString().slice(0, 10),
          sourceReferenceId,
        },
        "POST",
      );
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!state.data) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <StatusView {...state} onRetry={() => void state.refresh()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View accessibilityRole="radiogroup" style={styles.choices}>
          {(["bill", "renewal"] as const).map((value) => {
            const selected = type === value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={value}
                onPress={() => setType(value)}
                style={[styles.choice, selected && styles.choiceSelected]}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                  {value === "bill" ? "Bill" : "Renewal"}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.label}>What is it for?</Text>
        <TextInput
          accessibilityLabel="Reminder title"
          autoFocus
          maxLength={120}
          onChangeText={setTitle}
          placeholder={type === "bill" ? "Bill title" : "Renewal title"}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={title}
        />
        <Text style={styles.label}>Provider (optional)</Text>
        <TextInput
          accessibilityLabel="Provider"
          maxLength={120}
          onChangeText={setProvider}
          placeholder="Provider or organisation"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={provider}
        />
        <DateField
          label={type === "bill" ? "Due date" : "Renewal date"}
          onChange={setDate}
          value={date}
        />
        {state.data.sources.length > 0 ? (
          <>
            <Text style={styles.label}>Original source (optional)</Text>
            <View style={styles.sourceChoices}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: sourceReferenceId === "" }}
                onPress={() => setSourceReferenceId("")}
                style={[styles.sourceChoice, sourceReferenceId === "" && styles.sourceSelected]}
              >
                <Text style={styles.sourceText}>None</Text>
              </Pressable>
              {state.data.sources.map((source) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: sourceReferenceId === source.id }}
                  key={source.id}
                  onPress={() => setSourceReferenceId(source.id)}
                  style={[styles.sourceChoice, sourceReferenceId === source.id && styles.sourceSelected]}
                >
                  <Text style={styles.sourceText}>{source.title}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
        <Text style={styles.safety}>
          Payment details are never copied into the app. Open the original source when it is time to pay.
        </Text>
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          icon="checkmark"
          label="Add reminder"
          onPress={() => void submit()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  form: { gap: 12, padding: 18 },
  choices: { flexDirection: "row", gap: 8 },
  choice: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 46,
    justifyContent: "center",
  },
  choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 15, fontWeight: "700" },
  choiceTextSelected: { color: "#FFFFFF" },
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
  sourceChoices: { gap: 8 },
  sourceChoice: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  sourceSelected: { borderColor: colors.primary, borderWidth: 2 },
  sourceText: { color: colors.text, fontSize: 15 },
  safety: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
