import Link from "next/link";
import { ArrowRight, Inbox, Plus, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentHouseholdInboxItems,
  getInboxCategoryLabel,
  getInboxDestinationLabel,
  getInboxPriorityLabel,
  getSourceReferenceLabel,
  type InboxDestination,
  type InboxStatus,
} from "@/lib/demo-data";
import { getCurrentHousehold, getCurrentHouseholdMembers, getMemberDisplayName } from "@/lib/household";
import { cn } from "@/lib/utils";

const inboxStatuses: InboxStatus[] = ["New", "Needs review", "Linked"];
const captureDestinations: Array<{ value: InboxDestination; label: string }> = [
  { value: "task", label: "Task" },
  { value: "reminder", label: "Reminder" },
  { value: "bill_or_renewal", label: "Bill or renewal" },
  { value: "source_reference", label: "Source reference" },
];

function getInboxDestinationHref(destination: InboxDestination) {
  const hrefs: Record<InboxDestination, string> = {
    task: "/tasks",
    reminder: "/tasks",
    bill_or_renewal: "/bills",
    source_reference: "/sources",
  };

  return hrefs[destination] ?? "/inbox";
}

export default function InboxPage() {
  const household = getCurrentHousehold();
  const members = getCurrentHouseholdMembers();
  const inboxItems = getCurrentHouseholdInboxItems();
  const newItems = inboxItems.filter((item) => item.status === "New").length;
  const reviewItems = inboxItems.filter((item) => item.status === "Needs review").length;
  const linkedItems = inboxItems.filter((item) => item.status === "Linked").length;
  const highPriorityItems = inboxItems.filter((item) => item.priority === "High").length;

  return (
    <>
      <PageHeader
        title="Shared inbox"
        description={`A manual triage space for ${household.name} items before they become tasks, reminders, bills, renewals, or source references.`}
        action={
          <a href="#quick-capture" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </a>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
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
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Route className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-semibold leading-none">{highPriorityItems}</p>
              <p className="mt-1 text-sm font-medium">High priority</p>
              <p className="text-xs text-muted-foreground">Needs routing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card id="quick-capture" className="mt-6 scroll-mt-24">
        <CardHeader>
          <CardTitle>Quick capture</CardTitle>
          <CardDescription>Manual intake for household admin items.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="capture-title" className="text-sm font-medium">
                Title
              </label>
              <Input id="capture-title" name="title" placeholder="School form, home service note, or errand" />
            </div>

            <div className="space-y-2">
              <label htmlFor="capture-owner" className="text-sm font-medium">
                Owner
              </label>
              <Select id="capture-owner" name="owner" defaultValue={members[0]?.id}>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="capture-destination" className="text-sm font-medium">
                Destination
              </label>
              <Select id="capture-destination" name="destination" defaultValue="task">
                {captureDestinations.map((destination) => (
                  <option key={destination.value} value={destination.value}>
                    {destination.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="capture-priority" className="text-sm font-medium">
                Priority
              </label>
              <Select id="capture-priority" name="priority" defaultValue="Normal">
                <option>High</option>
                <option>Normal</option>
                <option>Low</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="capture-category" className="text-sm font-medium">
                Category
              </label>
              <Input id="capture-category" name="category" placeholder="School, appointment, renewal, or errand" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="capture-notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea id="capture-notes" name="notes" placeholder="What needs to happen, who is involved, and any timing to remember." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="capture-source" className="text-sm font-medium">
                Source reference
              </label>
              <Input id="capture-source" name="sourceReference" placeholder="Original email, PDF, link, image, or note reference" />
            </div>

            <div className="md:col-span-2">
              <Button type="reset" variant="outline" className="w-full sm:w-auto">
                Clear draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Manual triage board</CardTitle>
                <CardDescription>Review new household items and decide where they belong.</CardDescription>
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
                  <div className="grid gap-3 border-t pt-3">
                    {statusItems.map((item) => (
                      <article key={item.id} className="rounded-md border p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold leading-6">{item.title}</h3>
                            <p className="text-sm leading-5 text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge>{getInboxCategoryLabel(item.category)}</Badge>
                            <Badge>{getInboxPriorityLabel(item.priority)}</Badge>
                          </div>
                        </div>
                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="font-medium">Owner</dt>
                            <dd className="text-muted-foreground">{getMemberDisplayName(item.assignedMemberId)}</dd>
                          </div>
                          <div>
                            <dt className="font-medium">Suggested route</dt>
                            <dd className="text-muted-foreground">{getInboxDestinationLabel(item.suggestedDestination)}</dd>
                          </div>
                        </dl>
                        <div className="mt-4 rounded-md bg-muted/50 p-3">
                          <p className="text-sm font-medium leading-6">Routing reason</p>
                          <p className="text-sm leading-5 text-muted-foreground">{item.routingReason}</p>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-medium leading-6">Triage steps</p>
                          <ul className="mt-2 grid gap-2 sm:grid-cols-3">
                            {item.triageSteps.map((step) => (
                              <li key={step} className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Link href={getInboxDestinationHref(item.suggestedDestination)} className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}>
                          Open suggested route
                        </Link>
                      </article>
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
              <CardDescription>Next-step suggestions for each inbox item.</CardDescription>
            </CardHeader>
            <CardContent>
              {inboxItems.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.title}
                  detail={`${item.routingReason} Owner: ${getMemberDisplayName(item.assignedMemberId)}.`}
                  status={getInboxDestinationLabel(item.suggestedDestination)}
                  href={getInboxDestinationHref(item.suggestedDestination)}
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
                  href="/sources"
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
