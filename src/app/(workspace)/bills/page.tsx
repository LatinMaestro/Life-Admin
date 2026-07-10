import Link from "next/link";
import { FileCheck2, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { getBillsAndRenewalsReadModel } from "@/lib/server/module-read-models";

export default async function BillsPage() {
  const bills = await getBillsAndRenewalsReadModel();

  return (
    <>
      <PageHeader
        title="Bills and renewals"
        description={`Admin reminders for ${bills.household.name} due dates and renewals. Original sources stay the reference point.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Capture reminder
          </Link>
        }
      />

      <ReadModelSummary
        title="Reminder board"
        description="Household-scoped bill and renewal reminders with source-first review."
        counts={bills.counts}
        rows={bills.rows}
        emptyLabel="No bill or renewal reminders have been captured yet."
        actionHref="/sources"
        actionLabel="Open sources"
      />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <FileCheck2 className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Source-first review rules</CardTitle>
                <CardDescription>Every reminder keeps the original source as the reference point before household action.</CardDescription>
              </div>
            </div>
            <Badge>Source reference only</Badge>
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
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <CardTitle>Safety posture</CardTitle>
              <CardDescription>Bill and renewal pages remain admin reminders, not financial analytics.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Reminder details should point back to the confirmed source and avoid copying sensitive source contents into structured app fields.
        </CardContent>
      </Card>
    </>
  );
}
