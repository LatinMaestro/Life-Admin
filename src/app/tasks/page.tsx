import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { getCurrentHouseholdReminders, getCurrentHouseholdTasks } from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";

export default function TasksPage() {
  const household = getCurrentHousehold();
  const tasks = getCurrentHouseholdTasks();
  const reminders = getCurrentHouseholdReminders();

  return (
    <>
      <PageHeader
        title="Tasks and reminders"
        description={`Manual ${household.name} tasks and reminders with simple ownership, due dates, and status placeholders.`}
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
                key={task.id}
                title={task.title}
                detail={`Due ${task.due} - Assigned to ${getMemberDisplayName(task.assignedMemberId)}`}
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
                key={reminder.id}
                title={reminder.title}
                detail={`Reminder for ${getMemberDisplayName(reminder.assignedMemberId)}`}
                status={reminder.due}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
