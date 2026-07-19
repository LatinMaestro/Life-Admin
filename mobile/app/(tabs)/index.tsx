import { useRouter } from "expo-router";
import { Pressable } from "react-native";

import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource } from "@/lib/api";
import type { BootstrapResponse } from "@/lib/contracts";

export default function HomeScreen() {
  const router = useRouter();
  const state = useApiResource<BootstrapResponse>("/api/v1/bootstrap");

  if (!state.data) {
    return (
      <Screen>
        <PageTitle title="Home" />
        <StatusView {...state} onRetry={() => void state.refresh()} />
      </Screen>
    );
  }

  const { household, currentMember, counts } = state.data;
  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title={household.name} subtitle={`Hello, ${currentMember.displayName}`} />
      <Section title="Right now">
        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/inbox")}>
          <Row title="Inbox" detail={`${counts.inbox} items waiting to be sorted`} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/tasks")}>
          <Row title="Tasks" detail={`${counts.tasks} open household jobs`} />
        </Pressable>
      </Section>
      <Section title="Coming up">
        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/tasks")}>
          <Row title="Reminders" meta={`${counts.reminders} active`} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/shopping")}>
          <Row title="Shopping" meta={`${counts.shoppingItems} items`} />
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push("/bills")}>
          <Row title="Bills & renewals" meta={`${counts.billsAndRenewals} reminders`} />
        </Pressable>
      </Section>
      {counts.sourceReferencesNeedingReview > 0 ? (
        <Section title="Needs attention">
          <Pressable accessibilityRole="button" onPress={() => router.push("/sources")}>
            <Row title="Source references" meta={`${counts.sourceReferencesNeedingReview} to review`} />
          </Pressable>
        </Section>
      ) : null}
    </Screen>
  );
}
