import Link from "next/link";
import { Check, FileText, Inbox, X } from "lucide-react";
import {
  confirmIntakeDraftAction,
  dismissIntakeDraftAction,
} from "@/app/(workspace)/inbox/intake-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getConfiguredPersistenceMode } from "@/lib/server/persistence";
import { listIntakeDrafts } from "@/lib/server/intake-drafts";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

export async function IntakeDraftReview() {
  if (getConfiguredPersistenceMode() !== "prisma") return null;
  const [result, context] = await Promise.all([
    getRuntimeHouseholdAccessContext().then(listIntakeDrafts),
    getRuntimeHouseholdAccessContext(),
  ]);
  if (!result.drafts.length) return null;

  return (
    <section className="mb-6" aria-labelledby="review-heading">
      <div className="mb-3 flex items-center gap-2">
        <Inbox className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 id="review-heading" className="text-lg font-semibold">Ready to review</h2>
      </div>
      <div className="space-y-3">
        {result.drafts.map((draft) => {
          const eventDate = draft.proposedType === "renewal" ? draft.renewalAt : draft.dueAt;
          const needsDate = ["reminder", "bill", "renewal"].includes(draft.proposedType);
          return (
            <Card key={draft.id}>
              <CardHeader>
                <CardTitle className="text-base">{draft.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={confirmIntakeDraftAction} className="grid gap-4">
                  <input type="hidden" name="draftId" value={draft.id} />
                  <label className="grid gap-1.5 text-sm font-medium">
                    Save as
                    <select name="proposedType" defaultValue={draft.proposedType} className="h-10 rounded-md border bg-background px-3">
                      <option value="inbox">Inbox item</option>
                      <option value="task">Task</option>
                      <option value="reminder">Reminder</option>
                      <option value="bill">Bill reminder</option>
                      <option value="renewal">Renewal reminder</option>
                      <option value="source_reference">Source only</option>
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Title
                    <Input name="title" defaultValue={draft.title} minLength={2} maxLength={120} required />
                  </label>
                  {draft.proposedType === "bill" || draft.proposedType === "renewal" ? (
                    <label className="grid gap-1.5 text-sm font-medium">
                      Provider
                      <Input name="provider" defaultValue={draft.provider ?? ""} maxLength={100} />
                    </label>
                  ) : <input type="hidden" name="provider" value={draft.provider ?? ""} />}
                  {needsDate ? (
                    <label className="grid gap-1.5 text-sm font-medium">
                      Date
                      <Input name="eventDate" type="date" defaultValue={eventDate?.slice(0, 10) ?? ""} required />
                    </label>
                  ) : <input type="hidden" name="eventDate" value={eventDate?.slice(0, 10) ?? ""} />}
                  <label className="grid gap-1.5 text-sm font-medium">
                    Notes
                    <textarea
                      name="safeNotes"
                      defaultValue={draft.safeNotes ?? ""}
                      maxLength={500}
                      rows={3}
                      className="rounded-md border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <input type="hidden" name="assignedMemberId" value={draft.proposedAssignedMemberId ?? context.memberId} />
                  {draft.warnings.map((warning) => (
                    <p key={warning} className="text-sm text-muted-foreground">{warning}</p>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">
                      <Check className="h-4 w-4" aria-hidden="true" />
                      Confirm
                    </Button>
                    {draft.channel !== "voice" ? (
                      <Link href="/sources" className={buttonVariants({ variant: "outline" })}>
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Open source
                      </Link>
                    ) : null}
                  </div>
                </form>
                <form action={dismissIntakeDraftAction} className="mt-2">
                  <input type="hidden" name="draftId" value={draft.id} />
                  <Button type="submit" variant="ghost">
                    <X className="h-4 w-4" aria-hidden="true" />
                    Dismiss
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
