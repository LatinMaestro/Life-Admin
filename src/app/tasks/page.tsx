import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { reminders, tasks } from "@/lib/demo-data";

export default function TasksPage() {
  return (
    <>
      <PageHeader
        title="Tasks and reminders"
        description="Manual household tasks and reminders with simple ownership, due dates, and status placeholders."
        action={
          <Button type="button">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Household tasks</CardTitle>
            <CardDescription>Sample shared tasks with assignees and status.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks.map((task) => (
              <ItemRow
                key={task.title}
                title={task.title}
                detail={`Due ${task.due} - Assigned to ${task.assignee}`}
                status={task.status}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
            <CardDescription>Simple reminder placeholders. Notifications are not implemented.</CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.map((reminder) => (
              <ItemRow
                key={reminder.title}
                title={reminder.title}
                detail={`Reminder for ${reminder.assignee}`}
                status={reminder.due}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
