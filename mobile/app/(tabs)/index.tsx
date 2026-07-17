import { CountTile, PageTitle, Row, Screen, Section, StatusView, uiStyles } from "@/components/ui";
import { useApiResource } from "@/lib/api";
import type { BootstrapResponse } from "@/lib/contracts";

export default function HomeScreen() {
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
        <Row title="Inbox" detail={`${counts.inbox} items waiting to be sorted`} />
        <Row title="Tasks" detail={`${counts.tasks} open household jobs`} />
      </Section>
      <Section title="Coming up">
        <Row title="Reminders" meta={`${counts.reminders} active`} />
        <Row title="Shopping" meta={`${counts.shoppingItems} items`} />
        <Row title="Bills & renewals" meta={`${counts.billsAndRenewals} reminders`} />
      </Section>
      {counts.sourceReferencesNeedingReview > 0 ? (
        <Section title="Needs attention">
          <Row title="Source references" meta={`${counts.sourceReferencesNeedingReview} to review`} />
        </Section>
      ) : null}
    </Screen>
  );
}
