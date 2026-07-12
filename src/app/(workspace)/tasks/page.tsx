import { Bell, ClipboardCheck, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { TaskReminderCapture } from "@/components/task-reminder-capture";
import { getTasksReadModel } from "@/lib/server/module-read-models";

export default async function TasksPage() {
  const tasks = await getTasksReadModel();

  return (
    <>
      <PageHeader
        title="Tasks and reminders"
        description={`${tasks.household.name} tasks and reminders with owners, due dates, priorities, and cadence.`}
        action={
          <a href="#capture-work" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </a>
        }
      />

      <ReadModelSummary
        title="Task and reminder queue"
        description="Household-scoped work items ready for action, review, or completion."
        counts={tasks.counts}
        rows={tasks.rows}
        emptyLabel="No tasks or reminders have been captured yet."
        actionHref="#capture-work"
        actionLabel="Add task or reminder"
      />

      <TaskReminderCapture />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ClipboardCheck className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Task workflow</CardTitle>
                <CardDescription>
                  Manual capture, action, review, and completion stay household-scoped.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {["Capture", "Action", "Review", "Done"].map((stage) => (
              <div key={stage} className="rounded-md border p-3">
                <p className="text-sm font-semibold leading-6">{stage}</p>
                <p className="text-sm leading-5 text-muted-foreground">
                  A calm path from intake to completion.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Bell className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Reminder posture</CardTitle>
                <CardDescription>
                  Reminder dates are household records, not notification delivery.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            The app records the date and cadence for shared planning. Push, SMS, email, and
            other notification integrations remain deferred.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
