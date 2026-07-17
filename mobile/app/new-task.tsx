import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateField } from "@/components/date-field";
import { MemberField } from "@/components/member-field";
import { PrimaryButton } from "@/components/primary-button";
import { StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { BootstrapResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function NewWorkScreen() {
  const router = useRouter();
  const household = useApiResource<BootstrapResponse>("/api/v1/bootstrap");
  const mutate = useHouseholdMutation();
  const [kind, setKind] = useState<"task" | "reminder">("task");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(() => {
    const value = new Date();
    value.setDate(value.getDate() + 1);
    return value;
  });
  const [assignedMemberId, setAssignedMemberId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const dateValue = date.toISOString().slice(0, 10);
      await mutate(
        "/api/v1/tasks",
        {
          kind,
          title,
          notes,
          dueAt: dateValue,
          remindAt: dateValue,
          assignedMemberId: assignedMemberId || household.data?.currentMember.id,
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

  if (!household.data) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <StatusView {...household} onRetry={() => void household.refresh()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View accessibilityRole="radiogroup" style={styles.choices}>
          {(["task", "reminder"] as const).map((value) => {
            const selected = kind === value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={value}
                onPress={() => setKind(value)}
                style={[styles.choice, selected && styles.choiceSelected]}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                  {value === "task" ? "Task" : "Reminder"}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.label}>What needs attention?</Text>
        <TextInput
          accessibilityLabel={kind === "task" ? "Task title" : "Reminder title"}
          autoFocus
          maxLength={120}
          onChangeText={setTitle}
          placeholder={kind === "task" ? "Task title" : "Reminder title"}
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={title}
        />
        <DateField
          label={kind === "task" ? "Due date" : "Reminder date"}
          onChange={setDate}
          value={date}
        />
        <MemberField
          members={household.data.members}
          onChange={setAssignedMemberId}
          value={assignedMemberId || household.data.currentMember.id}
        />
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          accessibilityLabel="Optional notes"
          maxLength={1000}
          multiline
          onChangeText={setNotes}
          placeholder="Anything the household should know"
          placeholderTextColor={colors.muted}
          style={[styles.input, styles.notes]}
          textAlignVertical="top"
          value={notes}
        />
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          icon="checkmark"
          label={kind === "task" ? "Add task" : "Add reminder"}
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
  notes: { minHeight: 100 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
