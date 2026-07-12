import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { TaskReminderCapture } from "@/components/task-reminder-capture";
import { buttonVariants } from "@/components/ui/button";
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
      />

      <TaskReminderCapture />
    </>
  );
}
