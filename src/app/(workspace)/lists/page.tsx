import { Check, Plus, ShoppingCart, Undo2 } from "lucide-react";
import { toggleShoppingItemAction } from "@/app/(workspace)/lists/actions";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { ShoppingCapture } from "@/components/shopping-capture";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getShoppingListsReadModel } from "@/lib/server/module-read-models";

export default async function ListsPage() {
  const lists = await getShoppingListsReadModel();

  return (
    <>
      <PageHeader
        title="Shopping"
        description={`Shared lists for ${lists.household.name}.`}
        action={
          <a href="#shopping-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </a>
        }
      />

      <ReadModelSummary
        title="Lists"
        description="What your household needs."
        counts={lists.counts}
        rows={lists.rows}
        emptyLabel="No shopping lists yet."
      />

      <ShoppingCapture lists={lists.lists} />

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle>Items</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {lists.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="space-y-2">
              {lists.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
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
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-10 w-10 shrink-0 p-0"
                      title={item.checked ? "Reopen item" : "Check item"}
                      aria-label={item.checked ? "Reopen item" : "Check item"}
                    >
                      {item.checked ? <Undo2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
