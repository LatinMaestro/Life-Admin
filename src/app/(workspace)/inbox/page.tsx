import Link from "next/link";
import { ArrowRight, Inbox, Plus, Route } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InboxCaptureForm } from "@/components/inbox-capture-form";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { getInboxReadModel } from "@/lib/server/module-read-models";

export default async function InboxPage() {
  const inbox = await getInboxReadModel();

  return (
    <>
      <PageHeader
        title="Shared inbox"
        description={`A manual triage space for ${inbox.household.name} items before they become household work.`}
        action={
          <a href="#quick-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </a>
        }
      />

      <ReadModelSummary
        title="Inbox triage"
        description="Household-scoped intake items ready to review, route, or link back to source references."
        counts={inbox.counts}
        rows={inbox.rows}
        emptyLabel="No inbox items have been captured yet."
        actionHref="/tasks"
        actionLabel="Open tasks"
      />

      <Card id="quick-capture" className="mt-6 scroll-mt-24">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Inbox className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <CardTitle>Quick capture</CardTitle>
              <CardDescription>
                Save a manual intake item directly to the active household.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <InboxCaptureForm />
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Route className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Manual routing</CardTitle>
                <CardDescription>
                  Inbox items stay reviewable before they become tasks, reminders, bills,
                  renewals, lists, or source references.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Saving records the active household and creator automatically. The selected
            destination remains a suggestion until a household member reviews and routes it.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Next step</CardTitle>
                <CardDescription>
                  Review captured items before turning them into household work.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/tasks" className={buttonVariants({ variant: "outline" })}>
              Open tasks
            </Link>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
