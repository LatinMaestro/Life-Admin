import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { useApiResource } from "@/lib/api";
import type { InboxResponse } from "@/lib/contracts";

export default function InboxScreen() {
  const state = useApiResource<InboxResponse>("/api/v1/inbox");
  const items = state.data?.items ?? [];

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Inbox" subtitle="Things the household still needs to sort." />
      <StatusView {...state} empty={Boolean(state.data) && items.length === 0} onRetry={() => void state.refresh()} />
      {items.length > 0 ? (
        <Section title="Waiting">
          {items.map((item) => (
            <Row
              key={item.id}
              title={item.title}
              detail={item.description}
              meta={item.category.replaceAll("_", " ")}
              trailing={item.priority === "high" ? <Pill>High</Pill> : null}
            />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}
