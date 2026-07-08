import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  History,
  Inbox,
  ListChecks,
  ShoppingCart,
  UserRoundCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentHouseholdActivity,
  getCurrentHouseholdBillReminders,
  getCurrentHouseholdDashboardItems,
  getCurrentHouseholdInboxItems,
  getCurrentHouseholdShoppingLists,
  getSourceReferenceLabel,
} from "@/lib/demo-data";
import { getCommentEntityLabel, getCurrentHouseholdComments, getCurrentHouseholdOpenComments } from "@/lib/collaboration-data";
import { getCurrentHousehold, getCurrentMember, getMemberDisplayName } from "@/lib/household";

export default function DashboardPage() {
  const household = getCurrentHousehold();
  const currentMember = getCurrentMember();
  const dashboardItems = getCurrentHouseholdDashboardItems();
  const inboxItems = getCurrentHouseholdInboxItems();
  const shoppingLists = getCurrentHouseholdShoppingLists();
  const billReminders = getCurrentHouseholdBillReminders();
  const comments = getCurrentHouseholdComments();
  const openComments = getCurrentHouseholdOpenComments();
  const activity = getCurrentHouseholdActivity();
  const todayAndOverdue = [...dashboardItems.overdue, ...dashboardItems.today];
  const assignedToCurrentMember = [
    ...dashboardItems.overdue,
    ...dashboardItems.today,
    ...dashboardItems.upcoming,
  ].filter((item) => item.assignedMemberId === currentMember.id);
  const openShoppingItems = shoppingLists.reduce(
    (total, list) => total + list.items.filter((item) => !item.checked).length,
    0,
  );
  const summary = [
    { label: "Overdue", value: String(dashboardItems.overdue.length), detail: "Needs attention", icon: AlertCircle, href: "/tasks" },
    { label: "Today", value: String(dashboardItems.today.length), detail: "Household items", icon: ListChecks, href: "/tasks" },
    { label: "Assigned", value: String(assignedToCurrentMember.length), detail: `For ${currentMember.displayName}`, icon: UserRoundCheck, href: "/tasks" },
    { label: "Inbox", value: String(inboxItems.length), detail: "Manual items", icon: Inbox, href: "/inbox" },
    { label: "Shopping", value: String(openShoppingItems), detail: "Open items", icon: ShoppingCart, href: "/lists" },
    { label: "Bills", value: String(billReminders.length), detail: "Source-linked", icon: ClipboardList, href: "/bills" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`A calm household command center for ${household.name}: what is due, who owns it, and where to go next.`}
        action={
          <Link href="/inbox" className={buttonVariants({ variant: "default" })}>
            Add inbox item
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.label} href={item.href} className="block rounded-md transition-transform hover:-translate-y-0.5">
              <Card>
                <CardContent className="flex items-center gap-3 p-4 xl:flex-col xl:items-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold leading-none">{item.value}</p>
                    <p className="mt-1 text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Priority today</CardTitle>
                  <CardDescription>Overdue and due-today household items, grouped for quick scanning.</CardDescription>
                </div>
                <Badge>{todayAndOverdue.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {todayAndOverdue.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.title}
                  detail={`${item.detail} - ${getMemberDisplayName(item.assignedMemberId)}`}
                  status={item.status}
                  href="/tasks"
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Upcoming</CardTitle>
                  <CardDescription>Near-term reminders and household admin items.</CardDescription>
                </div>
                <CalendarClock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              {dashboardItems.upcoming.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.title}
                  detail={`${item.detail} - ${getMemberDisplayName(item.assignedMemberId)}`}
                  status={item.status}
                  href="/tasks"
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bills and renewals</CardTitle>
              <CardDescription>Admin reminders that point back to original sources.</CardDescription>
            </CardHeader>
            <CardContent>
              {billReminders.map((bill) => (
                <ItemRow
                  key={bill.id}
                  title={bill.title}
                  detail={`${bill.provider} - ${getMemberDisplayName(bill.assignedMemberId)} - Source: ${getSourceReferenceLabel(bill.sourceReferenceId)}`}
                  status={bill.due}
                  href="/bills"
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
                  <CardDescription>Personal household worklist for this member.</CardDescription>
                </div>
                <Badge>{assignedToCurrentMember.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {assignedToCurrentMember.map((item) => (
                <ItemRow key={item.id} title={item.title} detail={item.detail} status={item.status} href="/tasks" />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shared inbox</CardTitle>
              <CardDescription>Manual capture items waiting to become household work.</CardDescription>
            </CardHeader>
            <CardContent>
              {inboxItems.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.title}
                  detail={`${item.description} Assigned to ${getMemberDisplayName(item.assignedMemberId)}.`}
                  status={item.status}
                  href="/inbox"
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shopping</CardTitle>
              <CardDescription>Open list items across active household lists.</CardDescription>
            </CardHeader>
            <CardContent>
              {shoppingLists.map((list) => {
                const openItems = list.items.filter((item) => !item.checked).length;

                return (
                  <ItemRow
                    key={list.id}
                    title={list.name}
                    detail={`${list.detail} - ${openItems} open of ${list.items.length}`}
                    status={list.status}
                    href="/lists"
                  />
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Recent comments</CardTitle>
                  <CardDescription>Household notes on shared items.</CardDescription>
                </div>
                <Badge>{openComments.length} open</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {comments.map((comment) => (
                <ItemRow
                  key={comment.id}
                  title={comment.entityTitle}
                  detail={`${comment.body} - ${getMemberDisplayName(comment.createdByMemberId)}`}
                  status={`${getCommentEntityLabel(comment.entityType)} - ${comment.createdAtLabel}`}
                  href="/activity"
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Recent activity</CardTitle>
                  <CardDescription>Household actions without exposing source document contents.</CardDescription>
                </div>
                <History className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              {activity.map((event) => (
                <ItemRow
                  key={event.id}
                  title={event.summary}
                  detail={`Recorded by ${getMemberDisplayName(event.actorMemberId)}`}
                  status="Activity"
                  href="/activity"
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
