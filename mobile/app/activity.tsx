import { useRouter } from "expo-router";

import { ActionButton } from "@/components/action-button";
import { PrimaryButton } from "@/components/primary-button";
import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource } from "@/lib/api";
import type { ActivityResponse } from "@/lib/contracts";

export default function ActivityScreen() {
  const router = useRouter();
  const state = useApiResource<ActivityResponse>("/api/v1/activity");
  const events = state.data?.events ?? [];
  const comments = state.data?.comments ?? [];
  const empty = Boolean(state.data) && events.length + comments.length === 0;

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Activity" subtitle="Recent changes and comments in the household." />
      <PrimaryButton label="Add comment" onPress={() => router.push("/new-comment")} />
      <StatusView {...state} empty={empty} onRetry={() => void state.refresh()} />
      {comments.length > 0 ? (
        <Section title="Comments">
          {comments.map((comment) => {
            const target = state.data?.targets.find(
              (item) => item.entityType === comment.entityType && item.entityId === comment.entityId,
            );
            return (
              <Row
                key={comment.id}
                title={comment.body}
                detail={target?.label}
                meta={formatDate(comment.createdAt)}
                trailing={
                  <ActionButton
                    icon="chevron-forward"
                    label={`Open ${target?.label ?? "commented item"}`}
                    onPress={() => router.push({
                      pathname: "/item-detail",
                      params: {
                        entityType: comment.entityType,
                        itemId: comment.entityId,
                      },
                    })}
                  />
                }
              />
            );
          })}
        </Section>
      ) : null}
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
    </Screen>
  );
}
