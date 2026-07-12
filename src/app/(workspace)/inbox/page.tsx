import { Archive, Inbox, Plus, Undo2 } from "lucide-react";
import { toggleInboxArchivedAction } from "@/app/(workspace)/inbox/actions";
import { InboxCaptureForm } from "@/components/inbox-capture-form";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { Button, buttonVariants } from "@/components/ui/button";
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
        renderAction={(row) => {
          const archived = row.status === "Archived";
          return (
            <form action={toggleInboxArchivedAction}>
              <input type="hidden" name="itemId" value={row.id} />
              <input type="hidden" name="archived" value={String(!archived)} />
              <Button
                type="submit"
                variant="outline"
                className="h-10 w-10 p-0"
                title={archived ? "Reopen" : "Archive"}
                aria-label={archived ? "Reopen" : "Archive"}
              >
                {archived ? <Undo2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
              </Button>
            </form>
          );
        }}
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
