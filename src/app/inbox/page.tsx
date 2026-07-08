import { ArrowRight, Inbox, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentHouseholdInboxItems,
  getInboxCategoryLabel,
  getInboxDestinationLabel,
  getSourceReferenceLabel,
  type InboxStatus,
} from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";

const inboxStatuses: InboxStatus[] = ["New", "Needs review", "Linked"];

export default function InboxPage() {
  const household = getCurrentHousehold();
  const inboxItems = getCurrentHouseholdInboxItems();
  const newItems = inboxItems.filter((item) => item.status === "New").length;
  const reviewItems = inboxItems.filter((item) => item.status === "Needs review").length;
  const linkedItems = inboxItems.filter((item) => item.status === "Linked").length;

  return (
    <>
      <PageHeader
        title="Shared inbox"
        description={`A manual triage space for ${household.name} items before they become tasks, reminders, bills, renewals, or source references.`}
        action={
          <Button type="button">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{newItems}</p>
              <p className="mt-1 text-sm font-medium">New</p>
              <p className="text-xs text-muted-foreground">Needs first look</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{reviewItems}</p>
              <p className="mt-1 text-sm font-medium">Needs review</p>
              <p className="text-xs text-muted-foreground">Confirm next step</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Inbox className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{linkedItems}</p>
              <p className="mt-1 text-sm font-medium">Linked</p>
              <p className="text-xs text-muted-foreground">Already routed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Manual triage board</CardTitle>
                <CardDescription>Email forwarding and automated intake remain future phases.</CardDescription>
              </div>
              <Badge>{inboxItems.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {inboxStatuses.map((status) => {
              const statusItems = inboxItems.filter((item) => item.status === status);

              return (
                <section key={status}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold leading-6">{status}</h2>
                    <Badge>{statusItems.length}</Badge>
                  </div>
                  <div className="border-t">
                    {statusItems.map((item) => (
                      <ItemRow
                        key={item.id}
                        title={item.title}
                        detail={`${item.description} Assigned to ${getMemberDisplayName(item.assignedMemberId)}.`}
                        status={getInboxCategoryLabel(item.category)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suggested routing</CardTitle>
              <CardDescription>Static hints for what each item should become next.</CardDescription>
            </CardHeader>
            <CardContent>
              {inboxItems.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.title}
                  detail={`Create as ${getInboxDestinationLabel(item.suggestedDestination).toLowerCase()}.`}
                  status={item.status}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Source references</CardTitle>
              <CardDescription>References point back to the original source without copying sensitive contents.</CardDescription>
            </CardHeader>
            <CardContent>
              {inboxItems.map((item) => (
                <ItemRow
                  key={item.sourceReferenceId}
                  title={item.title}
                  detail={getSourceReferenceLabel(item.sourceReferenceId)}
                  status="Source"
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
