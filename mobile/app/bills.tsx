import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource } from "@/lib/api";
import type { BillsResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function BillsScreen() {
  const state = useApiResource<BillsResponse>("/api/v1/bills");
  const items = state.data?.items ?? [];
  const sources = state.data?.sources ?? [];

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
                  source?.url ? (
                    <Pressable
                      accessibilityLabel={`Open original source for ${item.title}`}
                      accessibilityRole="link"
                      onPress={() => void Linking.openURL(source.url!)}
                      style={styles.openButton}
                    >
                      <Text style={styles.openText}>Open source</Text>
                    </Pressable>
                  ) : (
                    <Pill>{item.type === "bill" ? "Bill" : "Renewal"}</Pill>
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
