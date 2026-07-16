import Link from "next/link";
import { Check, ExternalLink, FileCheck2, Plus, Undo2 } from "lucide-react";
import { toggleBillOrRenewalCompletedAction } from "@/app/(workspace)/bills/actions";
import { BillCapture } from "@/components/bill-capture";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { Button, buttonVariants } from "@/components/ui/button";
import { getBillsAndRenewalsReadModel } from "@/lib/server/module-read-models";
import { getConfiguredPersistenceMode } from "@/lib/server/persistence";

export default async function BillsPage() {
  const bills = await getBillsAndRenewalsReadModel();

  return (
    <>
      <PageHeader
        title="Bills and renewals"
        description={`Due dates and renewals for ${bills.household.name}.`}
        action={
          <a href="#bill-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </a>
        }
      />

      <ReadModelSummary
        title="Reminders"
        description="Upcoming household admin."
        counts={bills.counts}
        rows={bills.rows}
        emptyLabel="No bills or renewals need attention."
        allowEditing={getConfiguredPersistenceMode() === "prisma"}
        renderAction={(row) => {
          const completed = row.status === "Done";
          return (
            <>
              {row.href.startsWith("https://") ? (
                <Link
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                  title="Open original source"
                  aria-label="Open original source"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              ) : null}
              <form action={toggleBillOrRenewalCompletedAction}>
                <input type="hidden" name="itemId" value={row.id} />
                <input type="hidden" name="completed" value={String(!completed)} />
                <Button
                  type="submit"
                  variant="outline"
                  className="h-10 w-10 p-0"
                  title={completed ? "Reopen" : "Mark done"}
                  aria-label={completed ? "Reopen" : "Mark done"}
                >
                  {completed ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                </Button>
              </form>
            </>
          );
        }}
      />

      <BillCapture sources={bills.sources} members={bills.members} />

      <div className="mt-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm text-muted-foreground">
        <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>Open the original source before paying or renewing.</p>
      </div>
    </>
  );
}
