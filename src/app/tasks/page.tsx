import { Bell, CheckCircle2, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentHouseholdReminders,
  getCurrentHouseholdTasks,
  getReminderCadenceLabel,
  getTaskPriorityLabel,
} from "@/lib/demo-data";
import { getCurrentHousehold, getCurrentMember, getMemberDisplayName } from "@/lib/household";

export default function TasksPage() {
  const household = getCurrentHousehold();
  const currentMember = getCurrentMember();
  const tasks = getCurrentHouseholdTasks();
  const reminders = getCurrentHouseholdReminders();
  const openTasks = tasks.filter((task) => task.status === "Open");
  const doneTasks = tasks.filter((task) => task.status === "Done");
  const assignedToCurrentMember = tasks.filter((task) => task.assignedMemberId === currentMember.id);

  return (
    <>
      <PageHeader
        title="Tasks and reminders"
        description={`Manual ${household.name} tasks and reminders with ownership, due dates, priorities, and reminder cadence placeholders.`}
        action={
          <Button type="button">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add task
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold leading-none">{openTasks.length}</p>
              <p className="text-sm font-medium">Open</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold leading-none">{doneTasks.length}</p>
              <p className="text-sm font-medium">Done</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Bell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold leading-none">{reminders.length}</p>
              <p className="text-sm font-medium">Reminders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold leading-none">{assignedToCurrentMember.length}</p>
              <p className="text-sm font-medium">For {currentMember.displayName}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Open tasks</CardTitle>
                  <CardDescription>Shared household tasks that still need action.</CardDescription>
                </div>
                <Badge>{openTasks.length} open</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {openTasks.map((task) => (
                <ItemRow
                  key={task.id}
                  title={task.title}
                  detail={`${task.notes} Assigned to ${getMemberDisplayName(task.assignedMemberId)}. Due ${task.due}.`}
                  status={getTaskPriorityLabel(task.priority)}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
              <CardDescription>Static examples of done household tasks.</CardDescription>
            </CardHeader>
            <CardContent>
              {doneTasks.map((task) => (
                <ItemRow
                  key={task.id}
                  title={task.title}
                  detail={`${task.notes} Assigned to ${getMemberDisplayName(task.assignedMemberId)}.`}
                  status={task.status}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Assigned to {currentMember.displayName}</CardTitle>
                  <CardDescription>Current-member task view, still backed by static demo data.</CardDescription>
                </div>
                <Badge>{assignedToCurrentMember.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {assignedToCurrentMember.map((task) => (
                <ItemRow
                  key={task.id}
                  title={task.title}
                  detail={`Due ${task.due} - ${task.notes}`}
                  status={task.status}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reminders</CardTitle>
              <CardDescription>Manual reminder placeholders. Notification integrations are not implemented.</CardDescription>
            </CardHeader>
            <CardContent>
              {reminders.map((reminder) => (
                <ItemRow
                  key={reminder.id}
                  title={reminder.title}
                  detail={`${reminder.notes} Owner: ${getMemberDisplayName(reminder.assignedMemberId)}.`}
                  status={`${getReminderCadenceLabel(reminder.cadence)} - ${reminder.due}`}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
