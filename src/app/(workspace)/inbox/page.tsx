import { Inbox, Plus } from "lucide-react";
import { InboxCaptureForm } from "@/components/inbox-capture-form";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInboxReadModel } from "@/lib/server/module-read-models";

export default async function InboxPage() {
  const inbox = await getInboxReadModel();

  return (
    <>
      <PageHeader
        title="Inbox"
        description={`Things ${inbox.household.name} needs to sort out.`}
        action={
          <a href="#quick-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </a>
        }
      />

      <ReadModelSummary
        title="Inbox items"
        description="Review these and decide what happens next."
        counts={inbox.counts}
        rows={inbox.rows}
        emptyLabel="Your inbox is clear."
      />

      <Card id="quick-capture" className="mt-6 scroll-mt-24">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Inbox className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle>Add to inbox</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <InboxCaptureForm />
        </CardContent>
      </Card>
    </>
  );
}
