import { Alert, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

import { ActionButton } from "@/components/action-button";
import { PrimaryButton } from "@/components/primary-button";
import { PageTitle, Row, Screen, Section, StatusView } from "@/components/ui";
import { formatDate, useApiResource, useHouseholdMutation } from "@/lib/api";
import type { TasksResponse } from "@/lib/contracts";

export default function TasksScreen() {
  const router = useRouter();
  const state = useApiResource<TasksResponse>("/api/v1/tasks");
  const mutate = useHouseholdMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const tasks = state.data?.tasks ?? [];
  const reminders = state.data?.reminders ?? [];
  const empty = Boolean(state.data) && tasks.length + reminders.length === 0;

  const toggle = async (
    id: string,
    entityType: "task" | "reminder",
    completed: boolean,
  ) => {
    setBusyId(id);
    try {
      await mutate(`/api/v1/tasks/${id}`, { entityType, completed });
      await state.refresh();
    } catch (error) {
      Alert.alert("Could not update", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen refreshing={state.loading} onRefresh={() => void state.refresh()}>
      <PageTitle title="Tasks" subtitle="Shared jobs and reminders." />
      <PrimaryButton label="Add task" onPress={() => router.push("/new-task")} />
      <StatusView {...state} empty={empty} onRetry={() => void state.refresh()} />
      {tasks.length > 0 ? (
        <Section title="Tasks">
          {tasks.map((task) => {
            const due = formatDate(task.dueAt);
            const completed = task.status === "done" || task.status === "completed";
            return (
              <Row
                key={task.id}
                title={task.title}
                detail={task.notes}
                meta={due ? `Due ${due}` : task.stage.replaceAll("_", " ")}
                trailing={
                  <View style={styles.actions}>
                    <ActionButton
                      icon="chevron-forward"
                      label={`Open ${task.title}`}
                      onPress={() => router.push({
                        pathname: "/item-detail",
                        params: { entityType: "task", itemId: task.id },
                      })}
                    />
                    <ActionButton
                      busy={busyId === task.id}
                      icon={completed ? "arrow-undo" : "checkmark"}
                      label={completed ? `Reopen ${task.title}` : `Complete ${task.title}`}
                      onPress={() => void toggle(task.id, "task", !completed)}
                      selected={completed}
                    />
                  </View>
                }
              />
            );
          })}
        </Section>
      ) : null}
      {reminders.length > 0 ? (
        <Section title="Reminders">
          {reminders.map((reminder) => {
            const completed = reminder.status === "done" || reminder.status === "completed";
            return (
              <Row
                key={reminder.id}
                title={reminder.title}
                detail={reminder.notes}
                meta={formatDate(reminder.remindAt)}
                trailing={
                  <View style={styles.actions}>
                    <ActionButton
                      icon="chevron-forward"
                      label={`Open ${reminder.title}`}
                      onPress={() => router.push({
                        pathname: "/item-detail",
                        params: { entityType: "reminder", itemId: reminder.id },
                      })}
                    />
                    <ActionButton
                      busy={busyId === reminder.id}
                      icon={completed ? "arrow-undo" : "checkmark"}
                      label={completed ? `Reopen ${reminder.title}` : `Complete ${reminder.title}`}
                      onPress={() => void toggle(reminder.id, "reminder", !completed)}
                      selected={completed}
                    />
                  </View>
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
  actions: { alignItems: "center", flexDirection: "row", gap: 8 },
});
