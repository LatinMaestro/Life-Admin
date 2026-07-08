import Link from "next/link";
import { FileCheck2, Plus } from "lucide-react";
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
  const sourceLinked = billReminders.filter((bill) => bill.sourceReferenceId).length;

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

      <section className="grid gap-3 sm:grid-cols-4">
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
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Source linked</CardDescription>
            <CardTitle className="text-2xl">{sourceLinked}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Source-first review rules</CardTitle>
              <CardDescription>Every reminder keeps the original source as the reference point before household action.</CardDescription>
            </div>
            <FileCheck2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Record the obligation</p>
              <p className="text-sm leading-5 text-muted-foreground">Keep provider, timing, owner, notes, status, and source reference only.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Open the source</p>
              <p className="text-sm leading-5 text-muted-foreground">Use the original source document, link, image, or note before acting.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Leave a household trail</p>
              <p className="text-sm leading-5 text-muted-foreground">Use comments and activity to show what changed without copying sensitive source contents.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
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
                      <dt className="font-medium">Next step</dt>
                      <dd className="text-muted-foreground">{bill.nextStep}</dd>
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

                  <div className="mt-4">
                    <p className="text-sm font-medium leading-6">Review checklist</p>
                    <ul className="mt-2 space-y-2">
                      {bill.reviewChecklist.map((step) => (
                        <li key={step} className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

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
