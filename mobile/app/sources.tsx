import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource } from "@/lib/api";
import type { SourcesResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function SourcesScreen() {
  const state = useApiResource<SourcesResponse>("/api/v1/sources");
  const sources = state.data?.sources ?? [];

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle
        title="Sources"
        subtitle="Original links and document references used to check household admin."
      />
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
                source.url ? (
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => void Linking.openURL(source.url!)}
                    style={styles.openButton}
                  >
                    <Text style={styles.openText}>Open</Text>
                  </Pressable>
                ) : source.reviewStatus !== "confirmed" ? (
                  <Pill>Review</Pill>
                ) : null
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
