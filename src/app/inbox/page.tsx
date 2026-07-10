import Link from "next/link";
import { ArrowRight, Inbox, Plus, Route } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
              <CardDescription>Static manual intake draft for household admin items.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="capture-title" className="text-sm font-medium">
                Title
              </label>
              <Input id="capture-title" name="title" placeholder="School form, home service note, or errand" />
            </div>

            <div className="space-y-2">
              <label htmlFor="capture-destination" className="text-sm font-medium">
                Destination
              </label>
              <Select id="capture-destination" name="destination" defaultValue="task">
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
                <option value="bill_or_renewal">Bill or renewal</option>
                <option value="source_reference">Source reference</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="capture-priority" className="text-sm font-medium">
                Priority
              </label>
              <Select id="capture-priority" name="priority" defaultValue="normal">
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="capture-notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea id="capture-notes" name="notes" placeholder="What needs to happen, who is involved, and any timing to remember." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="capture-source" className="text-sm font-medium">
                Source reference
              </label>
              <Input id="capture-source" name="sourceReference" placeholder="Original email, PDF, link, image, or note reference" />
            </div>

            <div className="md:col-span-2">
              <Button type="reset" variant="outline" className="w-full sm:w-auto">
                Clear draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <Route className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Manual routing</CardTitle>
                <CardDescription>Inbox items stay reviewable before they become tasks, reminders, bills, renewals, or source references.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Future writes can attach the selected household, creator, owner, and destination while the current page remains static.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Next step</CardTitle>
                <CardDescription>Keep manual capture as the default until live persistence and review flows are approved.</CardDescription>
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
