import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource } from "@/lib/api";
import type { ActivityResponse } from "@/lib/contracts";

export default function ActivityScreen() {
  const state = useApiResource<ActivityResponse>("/api/v1/activity");
  const events = state.data?.events ?? [];
  const comments = state.data?.comments ?? [];
  const empty = Boolean(state.data) && events.length + comments.length === 0;

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Activity" subtitle="Recent changes and comments in the household." />
      <StatusView {...state} empty={empty} onRetry={() => void state.refresh()} />
      {events.length > 0 ? (
        <Section title="Recent changes">
          {events.map((event) => (
            <Row
              key={event.id}
              title={event.summary}
              meta={formatDate(event.createdAt)}
            />
          ))}
        </Section>
      ) : null}
      {comments.length > 0 ? (
        <Section title="Comments">
          {comments.map((comment) => (
            <Row
              key={comment.id}
              title={comment.body}
              meta={formatDate(comment.createdAt)}
            />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}
