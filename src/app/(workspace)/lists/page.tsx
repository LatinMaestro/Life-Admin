import Link from "next/link";
import { ClipboardList, Plus, ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ReadModelSummary } from "@/components/read-model-summary";
import { getShoppingListsReadModel } from "@/lib/server/module-read-models";

export default async function ListsPage() {
  const lists = await getShoppingListsReadModel();

  return (
    <>
      <PageHeader
        title="Shopping lists"
        description={`Shared ${lists.household.name} lists for groceries, supplies, and errands.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Capture item
          </Link>
        }
      />

      <ReadModelSummary
        title="Shopping list overview"
        description="Household-scoped shopping lists and open item counts for the shared workspace."
        counts={lists.counts}
        rows={lists.rows}
        emptyLabel="No shopping lists have been created yet."
        actionHref="/inbox"
        actionLabel="Capture item"
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ShoppingCart className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Next shop view</CardTitle>
                <CardDescription>Future list detail screens can group open items by shop, category, and owner.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            The summary now reads through the household adapter boundary while detailed item editing remains a future live-write step.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <ClipboardList className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div>
                <CardTitle>Shared list rules</CardTitle>
                <CardDescription>Lists stay practical, mobile-first, and focused on household coordination.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm leading-6 text-muted-foreground">
            Live item toggles, assignment, and list history should be added after the persistence write path is approved.
          </CardContent>
        </Card>
      </div>
    </>
  );
}
