import { PageTitle, Pill, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource } from "@/lib/api";
import type { TasksResponse } from "@/lib/contracts";

export default function TasksScreen() {
  const state = useApiResource<TasksResponse>("/api/v1/tasks");
  const tasks = state.data?.tasks ?? [];
  const reminders = state.data?.reminders ?? [];
  const empty = Boolean(state.data) && tasks.length + reminders.length === 0;

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Tasks" subtitle="Shared jobs and reminders." />
      <StatusView {...state} empty={empty} onRetry={() => void state.refresh()} />
      {tasks.length > 0 ? (
        <Section title="Tasks">
          {tasks.map((task) => {
            const due = formatDate(task.dueAt);
            return (
              <Row
                key={task.id}
                title={task.title}
                detail={task.notes}
                meta={due ? `Due ${due}` : task.stage.replaceAll("_", " ")}
                trailing={task.priority === "high" ? <Pill>High</Pill> : null}
              />
            );
          })}
        </Section>
      ) : null}
      {reminders.length > 0 ? (
        <Section title="Reminders">
          {reminders.map((reminder) => (
            <Row
              key={reminder.id}
              title={reminder.title}
              detail={reminder.notes}
              meta={formatDate(reminder.remindAt)}
            />
          ))}
        </Section>
      ) : null}
    </Screen>
  );
}
