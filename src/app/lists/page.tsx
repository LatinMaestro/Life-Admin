import Link from "next/link";
import { CheckCircle2, Circle, Plus, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getCurrentHouseholdShoppingLists } from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";

export default function ListsPage() {
  const household = getCurrentHousehold();
  const shoppingLists = getCurrentHouseholdShoppingLists();
  const items = shoppingLists.flatMap((list) => list.items.map((item) => ({ ...item, listName: list.name })));
  const checkedItems = items.filter((item) => item.checked);
  const openItems = items.filter((item) => !item.checked);
  const openCategories = Array.from(new Set(openItems.map((item) => item.category)));

  return (
    <>
      <PageHeader
        title="Shopping lists"
        description={`Shared ${household.name} lists for groceries, supplies, and errands.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Capture item
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active lists</CardDescription>
            <CardTitle className="text-2xl">{shoppingLists.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open items</CardDescription>
            <CardTitle className="text-2xl">{openItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Checked off</CardDescription>
            <CardTitle className="text-2xl">{checkedItems.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open categories</CardDescription>
            <CardTitle className="text-2xl">{openCategories.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Next shop view</CardTitle>
              <CardDescription>Open household items grouped for a quick manual shop.</CardDescription>
            </div>
            <Badge>{openItems.length} open</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {openItems.map((item) => {
              const owner = getMemberDisplayName(item.assignedMemberId ?? item.createdByMemberId);

              return (
                <article key={item.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold leading-6">{item.label}</h2>
                      <p className="text-sm leading-5 text-muted-foreground">{item.notes}</p>
                    </div>
                    <Badge>{item.quantity}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>{item.category}</Badge>
                    <Badge>{item.listName}</Badge>
                    <Badge>{owner}</Badge>
                  </div>
                </article>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {shoppingLists.map((list) => {
          const listOpenItems = list.items.filter((item) => !item.checked);

          return (
            <Card key={list.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                      <span className="text-xs font-medium uppercase tracking-wide">{list.status}</span>
                    </div>
                    <CardTitle>{list.name}</CardTitle>
                    <CardDescription>{list.detail} - {list.nextShop}</CardDescription>
                  </div>
                  <Badge className="shrink-0">{listOpenItems.length} open</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {list.items.map((item) => {
                    const owner = getMemberDisplayName(item.assignedMemberId ?? item.createdByMemberId);
                    const Icon = item.checked ? CheckCircle2 : Circle;

                    return (
                      <li key={item.id} className="rounded-md border p-3">
                        <div className="flex items-start gap-3">
                          <Icon
                            className={item.checked ? "mt-0.5 h-5 w-5 text-primary" : "mt-0.5 h-5 w-5 text-muted-foreground"}
                            aria-hidden="true"
                          />
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className={item.checked ? "text-sm font-medium text-muted-foreground line-through" : "text-sm font-medium"}>
                                {item.label}
                              </p>
                              <Badge>{item.quantity}</Badge>
                              <Badge>{item.category}</Badge>
                            </div>
                            <p className="text-sm leading-5 text-muted-foreground">{item.notes}</p>
                            <p className="text-xs font-medium text-muted-foreground">Owner: {owner}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
