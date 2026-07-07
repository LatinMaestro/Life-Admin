import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { getCurrentHouseholdBillReminders, getSourceReferenceLabel } from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";

export default function BillsPage() {
  const household = getCurrentHousehold();
  const billReminders = getCurrentHouseholdBillReminders();

  return (
    <>
      <PageHeader
        title="Bills and renewals"
        description={`Admin reminders for ${household.name} due dates and renewals. Payment details stay in the original source only.`}
        action={
          <Button type="button">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add reminder
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Source-linked reminders</CardTitle>
              <CardDescription>
                These placeholders show provider, due date, assignee, status, and source reference only.
              </CardDescription>
            </div>
            <Badge>Original source is truth</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {billReminders.map((bill) => (
            <ItemRow
              key={bill.id}
              title={bill.title}
              detail={`${bill.provider} - ${getMemberDisplayName(bill.assignedMemberId)} - Source: ${getSourceReferenceLabel(bill.sourceReferenceId)}`}
              status={`${bill.status} - ${bill.due}`}
            />
          ))}
        </CardContent>
      </Card>
    </>
  );
}
