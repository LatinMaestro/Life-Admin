import Link from "next/link";
import { ArrowRight, History, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { getActivityReadModel } from "@/lib/server/module-read-models";

export default async function ActivityPage() {
  const activity = await getActivityReadModel();

  return (
    <>
      <PageHeader
        title="Activity"
        description={`Comments and household activity for ${activity.household.name}, scoped to shared admin work.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            Capture item
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <ReadModelSummary
        title="Comments and activity"
        description="Household-scoped collaboration history without exposing private source contents."
        counts={activity.counts}
        rows={activity.rows}
        emptyLabel="No household comments or activity have been recorded yet."
        actionHref="/inbox"
        actionLabel="Capture item"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <History className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Shared trail</CardTitle>
                <CardDescription>Activity should explain what changed without repeating private document contents.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Comments and events stay attached to the active household workspace and remain ready for future live persistence.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Privacy posture</CardTitle>
                <CardDescription>Source references remain pointers to originals rather than copied source text.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            The activity view keeps collaboration useful while preserving the household document safety rules.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
