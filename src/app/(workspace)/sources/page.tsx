import { Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { SourceCapture } from "@/components/source-capture";
import { buttonVariants } from "@/components/ui/button";
import { getSourceReferencesReadModel } from "@/lib/server/module-read-models";

export default async function SourcesPage() {
  const sources = await getSourceReferencesReadModel();

  return (
    <>
      <PageHeader
        title="Sources"
        description={`Original links and references for ${sources.household.name}.`}
        action={
          <a href="#source-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </a>
        }
      />

      <ReadModelSummary
        title="Saved sources"
        description="Open the original before taking action."
        counts={sources.counts}
        rows={sources.rows}
        emptyLabel="No sources saved yet."
      />

      <SourceCapture />

      <div className="mt-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>Save where to find the original. Do not copy private document contents into notes.</p>
      </div>
    </>
  );
}
