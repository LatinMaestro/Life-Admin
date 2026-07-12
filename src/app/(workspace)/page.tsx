import Link from "next/link";
import { Bell, ClipboardList, Inbox, ListChecks, Plus, ShoppingCart } from "lucide-react";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    { label: "Tasks", value: dashboard.counts.openTasks, icon: ListChecks, href: "/tasks" },
    { label: "Reminders", value: dashboard.counts.scheduledReminders, icon: Bell, href: "/tasks" },
    { label: "Inbox", value: dashboard.counts.inboxItems, icon: Inbox, href: "/inbox" },
    { label: "Shopping", value: dashboard.counts.openShoppingItems, icon: ShoppingCart, href: "/lists" },
    { label: "Bills", value: dashboard.counts.billsAndRenewals, icon: ClipboardList, href: "/bills" },
  ];

  return (
    <>
      <PageHeader
        title="Home"
        description={`What needs attention in ${dashboard.household.name}.`}
        action={
          <Link href="/inbox#quick-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </Link>
        }
      />

      <section aria-label="Household overview" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="rounded-md border bg-card p-4 hover:bg-accent">
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 text-2xl font-semibold">{item.value}</p>
              <p className="text-sm">{item.label}</p>
            </Link>
          );
        })}
      </section>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>For {dashboard.currentMember.displayName}</CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.assignedToCurrentMember.length > 0 ? (
            dashboard.assignedToCurrentMember.map((item) => (
              <ItemRow
                key={item.id}
                title={item.title}
                detail="Assigned to you"
                status={formatStatus(item.status)}
                href={item.href}
              />
            ))
          ) : (
            <p className="py-4 text-sm text-muted-foreground">Nothing is assigned to you.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
