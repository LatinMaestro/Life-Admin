import Link from "next/link";
import { Bell, CheckCircle2, ClipboardCheck, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentHouseholdReminders,
  getCurrentHouseholdTasks,
  getReminderCadenceLabel,
  getReminderStageLabel,
  getTaskPriorityLabel,
  getTaskStageLabel,
  type TaskStage,
} from "@/lib/demo-data";
import { getCurrentHousehold, getCurrentMember, getMemberDisplayName } from "@/lib/household";

const taskStages: TaskStage[] = ["Capture", "Action", "Review", "Done"];

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
        description={`${household.name} tasks and reminders with owners, due dates, priorities, and cadence.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Capture task
          </Link>
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

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Task workflow</CardTitle>
              <CardDescription>Static stages for manual task capture, action, review, and completion.</CardDescription>
            </div>
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {taskStages.map((stage) => {
              const stageItems = tasks.filter((task) => task.stage === stage);

              return (
                <section key={stage} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold leading-6">{getTaskStageLabel(stage)}</h2>
                    <Badge>{stageItems.length}</Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    {stageItems.map((task) => (
                      <div key={task.id} className="rounded-md bg-muted/50 p-2">
                        <p className="text-sm font-medium leading-5">{task.title}</p>
                        <p className="text-xs leading-5 text-muted-foreground">{getMemberDisplayName(task.assignedMemberId)} - {task.due}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
            <CardContent className="space-y-3">
              {openTasks.map((task) => (
                <article key={task.id} className="rounded-md border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold leading-6">{task.title}</h2>
                      <p className="text-sm leading-5 text-muted-foreground">{task.notes}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{getTaskPriorityLabel(task.priority)}</Badge>
                      <Badge>{getTaskStageLabel(task.stage)}</Badge>
                    </div>
                  </div>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-medium">Owner</dt>
                      <dd className="text-muted-foreground">{getMemberDisplayName(task.assignedMemberId)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Due</dt>
                      <dd className="text-muted-foreground">{task.due}</dd>
                    </div>
                  </dl>
                  <div className="mt-4">
                    <p className="text-sm font-medium leading-6">Checklist</p>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {task.checklist.map((step) => (
                        <li key={step} className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
              <CardDescription>Recently completed household tasks.</CardDescription>
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
                  <CardDescription>Tasks owned by the current household member.</CardDescription>
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
                  status={getTaskStageLabel(task.stage)}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reminders</CardTitle>
              <CardDescription>Household reminders with owners, cadence, and next step.</CardDescription>
            </CardHeader>
            <CardContent>
              {reminders.map((reminder) => (
                <ItemRow
                  key={reminder.id}
                  title={reminder.title}
                  detail={`${reminder.nextStep} Owner: ${getMemberDisplayName(reminder.assignedMemberId)}.`}
                  status={`${getReminderStageLabel(reminder.stage)} - ${getReminderCadenceLabel(reminder.cadence)} - ${reminder.due}`}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
