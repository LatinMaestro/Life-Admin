import Link from "next/link";
import { ArrowRight, ClipboardList, Inbox, ListChecks, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { billReminders, dashboardItems, shoppingLists } from "@/lib/demo-data";

const summary = [
  { label: "Today", value: "2", detail: "Household items", icon: ListChecks },
  { label: "Inbox", value: "3", detail: "Manual items", icon: Inbox },
  { label: "Shopping", value: "2", detail: "Active lists", icon: ShoppingCart },
  { label: "Bills", value: "3", detail: "Source-linked reminders", icon: ClipboardList },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A quiet household overview for today, overdue items, shopping, and upcoming bill or renewal reminders."
        action={
          <Link href="/inbox" className={buttonVariants({ variant: "default" })}>
            Add inbox item
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3 p-4">
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
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today and overdue</CardTitle>
            <CardDescription>Manual tasks and reminders that need household attention.</CardDescription>
          </CardHeader>
          <CardContent>
            {[...dashboardItems.today, ...dashboardItems.overdue].map((item) => (
              <ItemRow key={item.title} title={item.title} detail={item.detail} status={item.status} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Simple reminders without automated extraction or notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardItems.upcoming.map((item) => (
              <ItemRow key={item.title} title={item.title} detail={item.detail} status={item.status} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shopping</CardTitle>
            <CardDescription>Shared lists for household errands and groceries.</CardDescription>
          </CardHeader>
          <CardContent>
            {shoppingLists.map((list) => (
              <ItemRow
                key={list.name}
                title={list.name}
                detail={`${list.detail} - ${list.items.length} placeholder items`}
                status="Active"
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Bills and renewals</CardTitle>
                <CardDescription>Admin reminders that point back to original sources.</CardDescription>
              </div>
              <Badge>Source only</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {billReminders.slice(0, 2).map((bill) => (
              <ItemRow
                key={bill.title}
                title={bill.title}
                detail={`${bill.provider} - ${bill.source}`}
                status={bill.due}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
