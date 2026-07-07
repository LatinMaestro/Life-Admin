import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { inboxItems } from "@/lib/demo-data";

export default function InboxPage() {
  return (
    <>
      <PageHeader
        title="Shared inbox"
        description="A manual capture space for household admin items before they become tasks, reminders, bills, renewals, or source references."
        action={
          <Button type="button">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Manual inbox items</CardTitle>
          <CardDescription>Static examples only. Email forwarding and AI intake are future phases.</CardDescription>
        </CardHeader>
        <CardContent>
          {inboxItems.map((item) => (
            <ItemRow
              key={item.title}
              title={item.title}
              detail={`${item.description} Source: ${item.source}.`}
              status={item.status}
            />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
