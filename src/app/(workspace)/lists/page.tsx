import { Check, ClipboardList, Plus, ShoppingCart, Undo2 } from "lucide-react";
import { toggleShoppingItemAction } from "@/app/(workspace)/lists/actions";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { ShoppingCapture } from "@/components/shopping-capture";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getShoppingListsReadModel } from "@/lib/server/module-read-models";

export default async function ListsPage() {
  const lists = await getShoppingListsReadModel();

  return (
    <>
      <PageHeader
        title="Shopping lists"
        description={`Shared ${lists.household.name} lists for groceries, supplies, and errands.`}
        action={
          <a href="#shopping-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </a>
        }
      />

      <ReadModelSummary
        title="Shopping list overview"
        description="Household-scoped shopping lists and open item counts for the shared workspace."
        counts={lists.counts}
        rows={lists.rows}
        emptyLabel="No shopping lists have been created yet."
        actionHref="#shopping-capture"
        actionLabel="Add list or item"
      />

      <ShoppingCapture lists={lists.lists} />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start gap-3">
            <ShoppingCart className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <CardTitle>Shopping items</CardTitle>
              <CardDescription>Check items off without leaving the shared household list.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lists.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shopping items yet.</p>
          ) : (
            <ul className="space-y-2">
              {lists.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <p className={item.checked ? "text-sm font-medium line-through" : "text-sm font-medium"}>
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.listName}{item.detail ? ` - ${item.detail}` : ""}
                    </p>
                  </div>
                  <form action={toggleShoppingItemAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="checked" value={String(!item.checked)} />
                    <Button type="submit" variant="outline" className="shrink-0">
                      {item.checked ? (
                        <Undo2 className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      )}
                      {item.checked ? "Reopen" : "Check"}
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <CardTitle>Shared list rules</CardTitle>
              <CardDescription>
                Lists stay practical, mobile-first, and focused on household coordination.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          New lists, items, and checked states are saved only inside the active household.
          Store integrations, barcode scanning, automation, and notifications remain deferred.
        </CardContent>
      </Card>
    </>
  );
}
