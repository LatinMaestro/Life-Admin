import Link from "next/link";
import { Archive, Check, ExternalLink, Plus, ShieldCheck, Undo2 } from "lucide-react";
import { setSourceReferenceStatusAction } from "@/app/(workspace)/sources/actions";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { SourceCapture } from "@/components/source-capture";
import { Button, buttonVariants } from "@/components/ui/button";
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
        renderAction={(row) => {
          if (row.entityType !== "source_reference") return null;
          const archived = row.status === "Archived";
          const confirmed = row.status === "Confirmed";

          return (
            <>
              {row.href.startsWith("https://") ? (
                <Link
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonVariants({ variant: "outline", size: "icon" })}
                  title="Open original source"
                  aria-label={`Open original source for ${row.title}`}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : null}
              {!archived && !confirmed ? (
                <form action={setSourceReferenceStatusAction}>
                  <input type="hidden" name="sourceId" value={row.id} />
                  <input type="hidden" name="status" value="confirmed" />
                  <Button type="submit" variant="outline" size="icon" title="Confirm source" aria-label={`Confirm ${row.title}`}>
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </form>
              ) : null}
              <form action={setSourceReferenceStatusAction}>
                <input type="hidden" name="sourceId" value={row.id} />
                <input type="hidden" name="status" value={archived ? "needs_review" : "archived"} />
                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  title={archived ? "Reopen source" : "Archive source"}
                  aria-label={archived ? `Reopen ${row.title}` : `Archive ${row.title}`}
                >
                  {archived ? <Undo2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                </Button>
              </form>
            </>
          );
        }}
      />

      <SourceCapture />

      <div className="mt-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>Save where to find the original. Do not copy private document contents into notes.</p>
      </div>
    </>
  );
}
