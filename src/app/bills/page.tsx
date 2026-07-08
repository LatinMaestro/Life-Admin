import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getCurrentHouseholdBillReminders, getSourceReferenceLabel } from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";
import { cn } from "@/lib/utils";

export default function BillsPage() {
  const household = getCurrentHousehold();
  const billReminders = getCurrentHouseholdBillReminders();
  const needsReview = billReminders.filter((bill) => bill.status === "Needs review");
  const renewals = billReminders.filter((bill) => bill.type === "renewal");

  return (
    <>
      <PageHeader
        title="Bills and renewals"
        description={`Admin reminders for ${household.name} due dates and renewals. Original sources stay the reference point.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Capture reminder
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total reminders</CardDescription>
            <CardTitle className="text-2xl">{billReminders.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Need review</CardDescription>
            <CardTitle className="text-2xl">{needsReview.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Renewals</CardDescription>
            <CardTitle className="text-2xl">{renewals.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Reminder board</CardTitle>
              <CardDescription>Provider, timing, owner, status, notes, and source reference.</CardDescription>
            </div>
            <Badge>Source reference only</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-3">
            {billReminders.map((bill) => {
              const sourceLabel = getSourceReferenceLabel(bill.sourceReferenceId);
              const assignedTo = getMemberDisplayName(bill.assignedMemberId);

              return (
                <article key={bill.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge>{bill.type === "bill" ? "Bill" : "Renewal"}</Badge>
                        <Badge>{bill.status}</Badge>
                      </div>
                      <h2 className="text-base font-semibold leading-6">{bill.title}</h2>
                      <p className="text-sm leading-5 text-muted-foreground">{bill.provider}</p>
                    </div>
                  </div>

                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-medium">Timing</dt>
                      <dd className="text-muted-foreground">{bill.due}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Reminder</dt>
                      <dd className="text-muted-foreground">{bill.reminderWindow}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Owner</dt>
                      <dd className="text-muted-foreground">{assignedTo}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Notes</dt>
                      <dd className="text-muted-foreground">{bill.notes}</dd>
                    </div>
                    <div>
                      <dt className="font-medium">Source</dt>
                      <dd className="text-muted-foreground">{sourceLabel}</dd>
                    </div>
                  </dl>

                  <Link href="/sources" className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}>
                    Open source
                  </Link>
                </article>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
