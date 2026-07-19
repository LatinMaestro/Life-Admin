import { Archive, Inbox, ListChecks, Plus, Undo2 } from "lucide-react";
import {
  routeInboxItemAction,
  toggleInboxArchivedAction,
} from "@/app/(workspace)/inbox/actions";
import { InboxCaptureForm } from "@/components/inbox-capture-form";
import { IntakeDraftReview } from "@/components/intake-draft-review";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getInboxReadModel } from "@/lib/server/module-read-models";
import { getConfiguredPersistenceMode } from "@/lib/server/persistence";

type InboxPageProps = {
  searchParams: Promise<{ route?: string; updated?: string; draft?: string }>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const inbox = await getInboxReadModel();
  const { route, updated, draft } = await searchParams;
  const openItems = inbox.rows.filter(
    (row) => row.status === "New" || row.status === "Needs Review",
  );
  const routingEnabled =
    getConfiguredPersistenceMode() === "prisma" && openItems.length > 0;

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

      {draft === "confirmed" ? (
        <p className="mb-4 text-sm text-primary" role="status">Household item confirmed.</p>
      ) : null}
      {draft === "dismissed" ? (
        <p className="mb-4 text-sm text-muted-foreground" role="status">Suggestion dismissed.</p>
      ) : null}
      {draft === "error" ? (
        <p className="mb-4 text-sm text-destructive" role="alert">Check the suggested details and try again.</p>
      ) : null}

      <IntakeDraftReview />

      {updated === "true" ? (
        <p className="mb-4 text-sm text-primary" role="status">
          Changes saved.
        </p>
      ) : null}

      {route === "done" ? (
        <p className="mb-4 text-sm text-primary" role="status">
          Inbox item sorted.
        </p>
      ) : null}

      <ReadModelSummary
        title="Inbox items"
        description="Review these and decide what happens next."
        counts={inbox.counts}
        rows={inbox.rows}
        emptyLabel="Your inbox is clear."
        allowEditing={getConfiguredPersistenceMode() === "prisma"}
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

      {routingEnabled ? (
        <details id="sort-inbox" className="mt-6 scroll-mt-24 rounded-md border bg-card">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium">
            <ListChecks className="h-4 w-4" aria-hidden="true" />
            Sort an inbox item
          </summary>
          <form action={routeInboxItemAction} className="space-y-4 border-t p-4">
            {route === "invalid" ? (
              <p className="text-sm text-destructive" role="alert">
                Check the item, destination, and any date or shopping list needed.
              </p>
            ) : null}
            <div className="space-y-1.5">
              <label htmlFor="route-item" className="text-sm font-medium">Inbox item</label>
              <select
                id="route-item"
                name="inboxItemId"
                required
                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Choose an item</option>
                {openItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="route-destination" className="text-sm font-medium">Turn into</label>
              <select
                id="route-destination"
                name="routeDestination"
                defaultValue="task"
                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
                <option value="shopping_item">Shopping item</option>
                <option value="bill">Bill reminder</option>
                <option value="renewal">Renewal reminder</option>
              </select>
            </div>
            <details className="rounded-md border">
              <summary className="cursor-pointer list-none p-3 text-sm font-medium">
                Date or shopping list
              </summary>
              <div className="grid gap-3 border-t p-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="route-date" className="text-sm font-medium">Date</label>
                  <Input id="route-date" name="routeDate" type="date" />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="route-list" className="text-sm font-medium">Shopping list</label>
                  <select
                    id="route-list"
                    name="shoppingListId"
                    className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Choose a list</option>
                    {inbox.lists.map((list) => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </details>
            <p className="text-sm text-muted-foreground">
              Reminders and bills need a date. Shopping items need a list.
            </p>
            <Button type="submit">Sort item</Button>
          </form>
        </details>
      ) : null}

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
