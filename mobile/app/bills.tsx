import { Alert, Linking, Pressable, StyleSheet, Text } from "react-native";
import { useState } from "react";

import { ActionButton } from "@/components/action-button";
import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource, useHouseholdMutation } from "@/lib/api";
import type { BillsResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function BillsScreen() {
  const state = useApiResource<BillsResponse>("/api/v1/bills");
  const mutate = useHouseholdMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const items = state.data?.items ?? [];
  const sources = state.data?.sources ?? [];

  const toggle = async (id: string, completed: boolean) => {
    setBusyId(id);
    try {
      await mutate(`/api/v1/bills/${id}`, { completed });
      await state.refresh();
    } catch (error) {
      Alert.alert("Could not update", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle
        title="Bills & renewals"
        subtitle="Due-date reminders only. Payment details stay in the original source."
      />
      <StatusView {...state} empty={Boolean(state.data) && items.length === 0} onRetry={() => void state.refresh()} />
      {items.length > 0 ? (
        <Section title="Upcoming">
          {items.map((item) => {
            const source = sources.find((entry) => entry.id === item.sourceReferenceId);
            const date = formatDate(item.type === "bill" ? item.dueAt : item.renewalAt);
            const completed = item.status === "done" || item.status === "completed";
            return (
              <Row
                key={item.id}
                title={item.title}
                detail={item.provider}
                meta={[
                  date ? `${item.type === "bill" ? "Due" : "Renews"} ${date}` : null,
                  source?.label,
                ].filter(Boolean).join(" - ")}
                trailing={
                  source?.url && !completed ? (
                    <Pressable
                      accessibilityLabel={`Open original source for ${item.title}`}
                      accessibilityRole="link"
                      onPress={() => void Linking.openURL(source.url!)}
                      style={styles.openButton}
                    >
                      <Text style={styles.openText}>Open source</Text>
                    </Pressable>
                  ) : (
                    <ActionButton
                      busy={busyId === item.id}
                      icon={completed ? "arrow-undo" : "checkmark"}
                      label={completed ? `Reopen ${item.title}` : `Complete ${item.title}`}
                      onPress={() => void toggle(item.id, !completed)}
                      selected={completed}
                    />
                  )
                }
              />
            );
          })}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  openButton: { paddingHorizontal: 8, paddingVertical: 10 },
  openText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
});
