import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { ActionButton } from "@/components/action-button";
import { PrimaryButton } from "@/components/primary-button";
import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { InboxResponse, IntakeDraftsResponse } from "@/lib/contracts";

export default function InboxScreen() {
  const router = useRouter();
  const state = useApiResource<InboxResponse>("/api/v1/inbox");
  const drafts = useApiResource<IntakeDraftsResponse>("/api/v1/intake-drafts");
  const mutate = useHouseholdMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const items = (state.data?.items ?? []).filter(
    (item) => item.status === "new" || item.status === "needs_review",
  );

  const archive = async (id: string) => {
    setBusyId(id);
    try {
      await mutate(`/api/v1/inbox/${id}`, { archived: true });
      await state.refresh();
    } catch (error) {
      Alert.alert("Could not update", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen
      refreshing={state.loading || drafts.loading}
      onRefresh={() => void Promise.all([state.refresh(), drafts.refresh()])}
    >
      <PageTitle title="Inbox" subtitle="Things the household still needs to sort." />
      <PrimaryButton label="Add to inbox" onPress={() => router.push("/new-inbox")} />
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/new-voice")}
        style={styles.voiceButton}
      >
        <Text style={styles.voiceText}>Record voice note</Text>
      </Pressable>
      {drafts.data?.drafts.length ? (
        <Section title="Ready to review">
          <Pressable accessibilityRole="button" onPress={() => router.push("/review-drafts")}>
            <Row
              title="Check suggestions"
              detail={`${drafts.data.drafts.length} waiting for your approval`}
              meta="Review"
            />
          </Pressable>
        </Section>
      ) : null}
      <StatusView {...state} empty={Boolean(state.data) && items.length === 0} onRetry={() => void state.refresh()} />
      {items.length > 0 ? (
        <Section title="Waiting">
          {items.map((item) => (
            <Row
              key={item.id}
              title={item.title}
              detail={item.description}
              meta={item.category.replaceAll("_", " ")}
              trailing={
                <View style={styles.actions}>
                  <ActionButton
                    icon="chevron-forward"
                    label={`Open ${item.title}`}
                    onPress={() => router.push({
                      pathname: "/item-detail",
                      params: { entityType: "inbox_item", itemId: item.id },
                    })}
                  />
                  {item.priority === "high" ? <Pill>High</Pill> : null}
                  <ActionButton
                    busy={busyId === item.id}
                    icon="checkmark"
                    label={`Mark ${item.title} as sorted`}
                    onPress={() => void archive(item.id)}
                  />
                </View>
              }
            />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  voiceButton: {
    alignItems: "center",
    borderColor: "#D5DAD4",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  voiceText: { color: "#28745F", fontSize: 15, fontWeight: "700" },
  actions: { alignItems: "center", flexDirection: "row", gap: 8 },
});
