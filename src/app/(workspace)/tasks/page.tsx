import { Check, Plus, Undo2 } from "lucide-react";
import { toggleWorkCompletedAction } from "@/app/(workspace)/tasks/actions";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { TaskReminderCapture } from "@/components/task-reminder-capture";
import { Button, buttonVariants } from "@/components/ui/button";
import { getTasksReadModel } from "@/lib/server/module-read-models";

export default async function TasksPage() {
  const tasks = await getTasksReadModel();

  return (
    <>
      <PageHeader
        title="Tasks"
        description={`What ${tasks.household.name} needs to do and remember.`}
        action={
          <a href="#capture-work" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </a>
        }
      />

      <ReadModelSummary
        title="Tasks and reminders"
        description="Open work for your household."
        counts={tasks.counts}
        rows={tasks.rows}
        emptyLabel="Nothing needs attention."
        renderAction={(row) => {
          if (row.entityType !== "task" && row.entityType !== "reminder") return null;
          const completed = row.status === "Done";
          return (
            <form action={toggleWorkCompletedAction}>
              <input type="hidden" name="itemId" value={row.id} />
              <input type="hidden" name="entityType" value={row.entityType} />
              <input type="hidden" name="completed" value={String(!completed)} />
              <Button
                type="submit"
                variant="outline"
                className="h-10 w-10 p-0"
                title={completed ? "Reopen" : "Mark done"}
                aria-label={completed ? "Reopen" : "Mark done"}
              >
                {completed ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </Button>
            </form>
          );
        }}
      />

      <TaskReminderCapture members={tasks.members} />
    </>
  );
}
