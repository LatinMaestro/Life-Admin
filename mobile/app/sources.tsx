import { Alert, Linking, Pressable, StyleSheet, Text } from "react-native";
import { useState } from "react";

import { ActionButton } from "@/components/action-button";
import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { SourcesResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function SourcesScreen() {
  const state = useApiResource<SourcesResponse>("/api/v1/sources");
  const mutate = useHouseholdMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const sources = state.data?.sources ?? [];

  const confirm = async (id: string) => {
    setBusyId(id);
    try {
      await mutate(`/api/v1/sources/${id}`, { status: "confirmed" });
      await state.refresh();
    } catch (error) {
      Alert.alert("Could not update", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Sources" subtitle="Original references used to check household admin." />
      <StatusView {...state} empty={Boolean(state.data) && sources.length === 0} onRetry={() => void state.refresh()} />
      {sources.length > 0 ? (
        <Section title="References">
          {sources.map((source) => (
            <Row
              key={source.id}
              title={source.title}
              detail={source.label}
              meta={source.kind.replaceAll("_", " ")}
              trailing={
                source.reviewStatus === "needs_review" ? (
                  <ActionButton
                    busy={busyId === source.id}
                    icon="checkmark"
                    label={`Confirm ${source.title}`}
                    onPress={() => void confirm(source.id)}
                  />
                ) : source.url ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => void Linking.openURL(source.url!)}
                    style={styles.openButton}
                  >
                    <Text style={styles.openText}>Open</Text>
                  </Pressable>
                ) : (
                  <Pill>Confirmed</Pill>
                )
              }
            />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  openButton: { paddingHorizontal: 8, paddingVertical: 10 },
  openText: { color: colors.primary, fontSize: 14, fontWeight: "700" },
});
