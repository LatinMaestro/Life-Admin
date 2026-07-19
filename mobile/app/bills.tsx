import { Alert, Linking, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

import { ActionButton } from "@/components/action-button";
import { PrimaryButton } from "@/components/primary-button";
import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource, useHouseholdMutation } from "@/lib/api";
import type { BillsResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function BillsScreen() {
  const router = useRouter();
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
      <PrimaryButton label="Add reminder" onPress={() => router.push("/new-bill")} />
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
                  <View style={styles.actions}>
                    <ActionButton
                      icon="chevron-forward"
                      label={`Open ${item.title}`}
                      onPress={() => router.push({
                        pathname: "/item-detail",
                        params: { entityType: "bill_or_renewal", itemId: item.id },
                      })}
                    />
                    {source?.url ? (
                      <Pressable
                        accessibilityLabel={`Open original source for ${item.title}`}
                        accessibilityRole="link"
                        onPress={() => void Linking.openURL(source.url!)}
                        style={styles.openButton}
                      >
                        <Ionicons color={colors.primary} name="open-outline" size={21} />
                      </Pressable>
                    ) : null}
                    <ActionButton
                      busy={busyId === item.id}
                      icon={completed ? "arrow-undo" : "checkmark"}
                      label={completed ? `Reopen ${item.title}` : `Complete ${item.title}`}
                      onPress={() => void toggle(item.id, !completed)}
                      selected={completed}
                    />
                  </View>
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
  actions: { alignItems: "center", flexDirection: "row", gap: 8 },
  openButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
});
