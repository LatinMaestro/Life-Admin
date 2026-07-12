import { FileCheck2, Plus } from "lucide-react";
import { BillCapture } from "@/components/bill-capture";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { buttonVariants } from "@/components/ui/button";
import { getBillsAndRenewalsReadModel } from "@/lib/server/module-read-models";

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
      />

      <BillCapture sources={bills.sources} />

      <div className="mt-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm text-muted-foreground">
        <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>Open the original source before paying or renewing.</p>
      </div>
    </>
  );
}
