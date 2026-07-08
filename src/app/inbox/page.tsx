import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { getCurrentHouseholdInboxItems, getSourceReferenceLabel } from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";

export default function InboxPage() {
  const household = getCurrentHousehold();
  const inboxItems = getCurrentHouseholdInboxItems();

  return (
    <>
      <PageHeader
        title="Shared inbox"
        description={`A manual capture space for ${household.name} items before they become tasks, reminders, bills, renewals, or source references.`}
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
              key={item.id}
              title={item.title}
              detail={`${item.description} Assigned to ${getMemberDisplayName(item.assignedMemberId)}. Source: ${getSourceReferenceLabel(item.sourceReferenceId)}.`}
              status={item.status}
            />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
