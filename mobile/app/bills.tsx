import { Linking } from "react-native";

import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource } from "@/lib/api";
import type { BillsResponse } from "@/lib/contracts";

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
                  source?.url ? "Open original source" : source?.label,
                ].filter(Boolean).join(" · ")}
                trailing={<Pill>{item.type === "bill" ? "Bill" : "Renewal"}</Pill>}
              />
            );
          })}
        </Section>
      ) : null}
    </Screen>
  );
}
