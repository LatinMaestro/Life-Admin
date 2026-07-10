import Link from "next/link";
import {
  ArrowRight,
  Bell,
  ClipboardList,
  FileText,
  History,
  Inbox,
  ListChecks,
  MessageSquareText,
  ShoppingCart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { getDashboardReadModel } from "@/lib/server/dashboard-read-model";

function formatStatus(status: string) {
  return status
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export default async function DashboardPage() {
  const dashboard = await getDashboardReadModel();
  const summary = [
    { label: "Open tasks", value: dashboard.counts.openTasks, icon: ListChecks, href: "/tasks" },
    { label: "Reminders", value: dashboard.counts.scheduledReminders, icon: Bell, href: "/tasks" },
    { label: "Inbox", value: dashboard.counts.inboxItems, icon: Inbox, href: "/inbox" },
    { label: "Shopping", value: dashboard.counts.openShoppingItems, icon: ShoppingCart, href: "/lists" },
    { label: "Bills and renewals", value: dashboard.counts.billsAndRenewals, icon: ClipboardList, href: "/bills" },
    { label: "Sources", value: dashboard.counts.sourceReferences, icon: FileText, href: "/sources" },
    { label: "Comments", value: dashboard.counts.comments, icon: MessageSquareText, href: "/activity" },
    { label: "Activity", value: dashboard.counts.activityEvents, icon: History, href: "/activity" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`A calm view of what needs attention across ${dashboard.household.name}.`}
        action={
          <Link href="/inbox" className={buttonVariants({ variant: "default" })}>
            Add inbox item
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <section aria-label="Household overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.label} href={item.href} className="block rounded-md transition-transform hover:-translate-y-0.5">
              <Card className="h-full">
                <CardContent className="flex min-h-24 items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-semibold leading-none">{item.value}</p>
                    <p className="mt-1 text-sm font-medium">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Needs review</CardTitle>
            <CardDescription>Queues that benefit from a quick household decision.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.reviewQueues.map((queue) => (
              <Link
                key={queue.href}
                href={queue.href}
                className="flex min-h-14 items-center justify-between gap-3 rounded-md border bg-background px-4 py-3 transition-colors hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-medium">{queue.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {queue.count === 0 ? "Nothing waiting" : `${queue.count} items waiting`}
                  </p>
                </div>
                <Badge variant={queue.count > 0 ? "default" : "secondary"}>{queue.count}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Assigned to {dashboard.currentMember.displayName}</CardTitle>
                <CardDescription>Open household work owned by the current member.</CardDescription>
              </div>
              <Badge>{dashboard.assignedToCurrentMember.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {dashboard.assignedToCurrentMember.length > 0 ? (
              dashboard.assignedToCurrentMember.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.title}
                  detail="Assigned in this household workspace."
                  status={formatStatus(item.status)}
                  href={item.href}
                />
              ))
            ) : (
              <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                No open items are assigned to this member.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Household rhythm</CardTitle>
          <CardDescription>Simple paths for the most common family admin work.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Link href="/inbox" className="rounded-md border p-4 transition-colors hover:bg-accent">
            <Inbox className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">Capture</p>
            <p className="mt-1 text-sm text-muted-foreground">Put a new household item in the shared inbox.</p>
          </Link>
          <Link href="/tasks" className="rounded-md border p-4 transition-colors hover:bg-accent">
            <ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">Coordinate</p>
            <p className="mt-1 text-sm text-muted-foreground">Review tasks, ownership, and reminders.</p>
          </Link>
          <Link href="/sources" className="rounded-md border p-4 transition-colors hover:bg-accent">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold">Confirm</p>
            <p className="mt-1 text-sm text-muted-foreground">Return to the original source before taking action.</p>
          </Link>
        </CardContent>
      </Card>
    </>
  );
}
