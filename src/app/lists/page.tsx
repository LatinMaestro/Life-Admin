import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getCurrentHouseholdShoppingLists } from "@/lib/demo-data";
import { getCurrentHousehold } from "@/lib/household";

export default function ListsPage() {
  const household = getCurrentHousehold();
  const shoppingLists = getCurrentHouseholdShoppingLists();

  return (
    <>
      <PageHeader
        title="Shopping lists"
        description={`Shared ${household.name} lists for groceries, supplies, and errands. Items shown here are static placeholders.`}
        action={
          <Button type="button">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add list
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {shoppingLists.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{list.name}</CardTitle>
                  <CardDescription>{list.detail}</CardDescription>
                </div>
                <Badge>{list.items.length} items</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {list.items.map((item) => (
                  <li key={item.id} className="flex min-h-10 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={
                        item.checked
                          ? "h-5 w-5 rounded-sm border bg-primary"
                          : "h-5 w-5 rounded-sm border bg-background"
                      }
                    />
                    <span className={item.checked ? "text-sm text-muted-foreground line-through" : "text-sm"}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
