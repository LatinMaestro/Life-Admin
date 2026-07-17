import { Plus, ShieldCheck } from "lucide-react";
import { CommentCapture } from "@/components/comment-capture";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { buttonVariants } from "@/components/ui/button";
import { getActivityReadModel } from "@/lib/server/module-read-models";

export default async function ActivityPage() {
  const activity = await getActivityReadModel();

  return (
    <>
      <PageHeader
        title="Activity"
        description={`Updates and comments for ${activity.household.name}.`}
        action={
          <a href="#comment-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Comment
          </a>
        }
      />

      <ReadModelSummary
        title="Recent activity"
        description="What changed in your household."
        counts={activity.counts}
        rows={activity.rows}
        emptyLabel="No activity yet."
      />

      <CommentCapture targets={activity.targets} />

      <div className="mt-4 flex items-start gap-3 rounded-md border px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>Keep comments brief and do not copy private source contents.</p>
      </div>
    </>
  );
}
