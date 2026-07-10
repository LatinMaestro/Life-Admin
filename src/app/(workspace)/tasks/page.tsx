import Link from "next/link";
import { Bell, ClipboardCheck, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { getTasksReadModel } from "@/lib/server/module-read-models";

export default async function TasksPage() {
  const tasks = await getTasksReadModel();

  return (
    <>
      <PageHeader
        title="Tasks and reminders"
        description={`${tasks.household.name} tasks and reminders with owners, due dates, priorities, and cadence.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Capture task
          </Link>
        }
      />

      <ReadModelSummary
        title="Task and reminder queue"
        description="Household-scoped work items ready for action, review, or completion."
        counts={tasks.counts}
        rows={tasks.rows}
        emptyLabel="No tasks or reminders have been captured yet."
        actionHref="/inbox"
        actionLabel="Capture task"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ClipboardCheck className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Task workflow</CardTitle>
                <CardDescription>Manual capture, action, review, and completion stay household-scoped.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {['Capture', 'Action', 'Review', 'Done'].map((stage) => (
              <div key={stage} className="rounded-md border p-3">
                <p className="text-sm font-semibold leading-6">{stage}</p>
                <p className="text-sm leading-5 text-muted-foreground">Ready for future drag, filters, and live updates.</p>
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
                <CardDescription>Reminders remain manually created until notification integrations are approved.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            The page is ready for future persistence while keeping the current experience static and reviewable.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
