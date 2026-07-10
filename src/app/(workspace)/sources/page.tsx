import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { getSourceReferencesReadModel } from "@/lib/server/module-read-models";

export default async function SourcesPage() {
  const sourceReferences = await getSourceReferencesReadModel();

  return (
    <>
      <PageHeader
        title="Sources"
        description={`Saved source references for ${sourceReferences.household.name} household admin items.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Capture source
          </Link>
        }
      />

      <ReadModelSummary
        title="Reference library"
        description="Household-scoped source references linked to inbox items, reminders, bills, and renewals."
        counts={sourceReferences.counts}
        rows={sourceReferences.rows}
        emptyLabel="No source references have been captured for this household yet."
        actionHref="/inbox"
        actionLabel="Capture source"
      />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Source handling rules</CardTitle>
              <CardDescription>References identify the original source without copying private document contents into the app.</CardDescription>
            </div>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Metadata only</p>
              <p className="text-sm leading-5 text-muted-foreground">Store title, kind, owner, status, linked area, and handling notes only.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Open original</p>
              <p className="text-sm leading-5 text-muted-foreground">Use the original source before acting on a bill, renewal, task, or reminder.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Keep notes high level</p>
              <p className="text-sm leading-5 text-muted-foreground">Activity and comments should describe actions without duplicating sensitive source contents.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
