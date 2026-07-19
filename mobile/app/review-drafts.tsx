import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { PrimaryButton } from "@/components/primary-button";
import { PageTitle, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { IntakeDraftsResponse, IntakeDraftType } from "@/lib/contracts";
import { colors } from "@/lib/theme";

type Draft = IntakeDraftsResponse["drafts"][number];

export default function ReviewDraftsScreen() {
  const state = useApiResource<IntakeDraftsResponse>("/api/v1/intake-drafts");
  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Review suggestions" subtitle="Check each item before saving it." />
      <StatusView
        {...state}
        empty={Boolean(state.data) && state.data.drafts.length === 0}
        emptyMessage="Nothing is waiting for review."
        onRetry={() => void state.refresh()}
      />
      {state.data?.drafts.length ? (
        <Section title="Waiting">
          {state.data.drafts.map((draft) => (
            <DraftReview key={draft.id} draft={draft} refresh={state.refresh} />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

function DraftReview({ draft, refresh }: { draft: Draft; refresh: () => Promise<void> }) {
  const router = useRouter();
  const mutate = useHouseholdMutation();
  const [title, setTitle] = useState(draft.title);
  const [provider, setProvider] = useState(draft.provider ?? "");
  const [notes, setNotes] = useState(draft.safeNotes ?? "");
  const [eventDate, setEventDate] = useState(
    (draft.proposedType === "renewal" ? draft.renewalAt : draft.dueAt)?.slice(0, 10) ?? "",
  );
  const [busy, setBusy] = useState(false);
  const needsDate = ["reminder", "bill", "renewal"].includes(draft.proposedType);

  async function confirm() {
    if (title.trim().length < 2 || (needsDate && !/^\d{4}-\d{2}-\d{2}$/.test(eventDate))) {
      Alert.alert("Check the details", needsDate ? "Add a date as YYYY-MM-DD." : "Add a title.");
      return;
    }
    setBusy(true);
    try {
      await mutate(
        `/api/v1/intake-drafts/${draft.id}/confirm`,
        {
          proposedType: draft.proposedType,
          title,
          provider: provider || null,
          safeNotes: notes || null,
          dueAt: draft.proposedType === "renewal" ? null : (eventDate || null),
          renewalAt: draft.proposedType === "renewal" ? (eventDate || null) : null,
          assignedMemberId: draft.proposedAssignedMemberId,
        },
        "POST",
      );
      await refresh();
    } catch (error) {
      Alert.alert("Could not save", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function dismiss() {
    setBusy(true);
    try {
      await mutate(`/api/v1/intake-drafts/${draft.id}/dismiss`, {}, "POST");
      await refresh();
    } catch (error) {
      Alert.alert("Could not dismiss", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.kind}>{labelForType(draft.proposedType)}</Text>
      <Text style={styles.label}>Title</Text>
      <TextInput
        accessibilityLabel="Suggested title"
        maxLength={120}
        onChangeText={setTitle}
        style={styles.input}
        value={title}
      />
      {draft.proposedType === "bill" || draft.proposedType === "renewal" ? (
        <>
          <Text style={styles.label}>Provider</Text>
          <TextInput
            accessibilityLabel="Suggested provider"
            maxLength={100}
            onChangeText={setProvider}
            style={styles.input}
            value={provider}
          />
        </>
      ) : null}
      {needsDate ? (
        <>
          <Text style={styles.label}>Date</Text>
          <TextInput
            accessibilityLabel="Suggested date"
            autoCapitalize="none"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            onChangeText={setEventDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={eventDate}
          />
        </>
      ) : null}
      <Text style={styles.label}>Notes</Text>
      <TextInput
        accessibilityLabel="Suggested notes"
        maxLength={500}
        multiline
        onChangeText={setNotes}
        style={[styles.input, styles.notes]}
        value={notes}
      />
      {draft.warnings.map((warning) => (
        <Text key={warning} style={styles.warning}>{warning}</Text>
      ))}
      <PrimaryButton busy={busy} icon="checkmark" label="Confirm" onPress={() => void confirm()} />
      {draft.channel !== "voice" ? (
        <Pressable accessibilityRole="button" onPress={() => router.push("/sources")} style={styles.secondary}>
          <Text style={styles.secondaryText}>Open source</Text>
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => void dismiss()} style={styles.dismiss}>
        <Text style={styles.dismissText}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

function labelForType(value: IntakeDraftType) {
  return {
    inbox: "Inbox item",
    task: "Task",
    reminder: "Reminder",
    bill: "Bill reminder",
    renewal: "Renewal reminder",
    source_reference: "Source only",
  }[value];
}

const styles = StyleSheet.create({
  card: { gap: 10, paddingVertical: 8 },
  kind: { color: colors.primary, fontSize: 14, fontWeight: "700" },
  label: { color: colors.text, fontSize: 14, fontWeight: "700" },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 48,
    padding: 12,
  },
  notes: { minHeight: 84, textAlignVertical: "top" },
  warning: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  secondary: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  secondaryText: { color: colors.primary, fontSize: 15, fontWeight: "700" },
  dismiss: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  dismissText: { color: colors.muted, fontSize: 15, fontWeight: "600" },
});
