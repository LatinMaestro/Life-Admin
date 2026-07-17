import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateHouseholdItemAction } from "@/app/(workspace)/edit/actions";
import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getEditableItem,
  isEditableItemType,
} from "@/lib/server/item-editing";
import { getConfiguredPersistenceMode, getHouseholdPersistenceAdapter } from "@/lib/server/persistence";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

type EditItemPageProps = {
  params: Promise<{ entityType: string; itemId: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditItemPage({
  params,
  searchParams,
}: EditItemPageProps) {
  if (getConfiguredPersistenceMode() !== "prisma") {
    redirect("/");
  }

  const { entityType, itemId } = await params;
  if (!isEditableItemType(entityType)) notFound();

  const context = await getRuntimeHouseholdAccessContext();
  const [item, members, query] = await Promise.all([
    getEditableItem(context, entityType, itemId),
    getHouseholdPersistenceAdapter().then((adapter) => adapter.listMembers(context)),
    searchParams,
  ]);
  if (!item) notFound();

  const returnPath =
    item.type === "inbox_item"
      ? "/inbox"
      : item.type === "bill_or_renewal"
        ? "/bills"
        : "/tasks";
  const pageTitle =
    item.type === "inbox_item"
      ? "Edit inbox item"
      : item.type === "bill_or_renewal"
        ? `Edit ${item.itemKind} reminder`
        : `Edit ${item.type}`;
  const dateLabel =
    item.type === "task"
      ? "Due date"
      : item.type === "reminder"
        ? "Reminder date"
        : item.type === "bill_or_renewal"
          ? item.itemKind === "bill"
            ? "Due date"
            : "Renewal date"
          : null;
  const dateValue = "date" in item ? formatDateInput(item.date) : "";

  return (
    <>
      <PageHeader title={pageTitle} description="Update the details that need correcting." />

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form action={updateHouseholdItemAction} className="space-y-4">
            <input type="hidden" name="entityType" value={item.type} />
            <input type="hidden" name="itemId" value={item.id} />

            {query.error ? (
              <p className="text-sm text-destructive" role="alert">
                Check the details and try again.
              </p>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={item.title}
                minLength={2}
                maxLength={120}
                required
              />
            </div>

            {item.type === "bill_or_renewal" ? (
              <div className="space-y-1.5">
                <label htmlFor="edit-provider" className="text-sm font-medium">Provider</label>
                <Input
                  id="edit-provider"
                  name="provider"
                  defaultValue={item.provider ?? ""}
                  maxLength={120}
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label htmlFor="edit-notes" className="text-sm font-medium">Notes</label>
              <Textarea
                id="edit-notes"
                name="notes"
                defaultValue={item.notes ?? ""}
                maxLength={1_000}
              />
            </div>

            {dateLabel ? (
              <div className="space-y-1.5">
                <label htmlFor="edit-date" className="text-sm font-medium">{dateLabel}</label>
                <Input
                  id="edit-date"
                  name="date"
                  type="date"
                  defaultValue={dateValue}
                  required={item.type === "reminder" || item.type === "bill_or_renewal"}
                />
              </div>
            ) : null}

            {item.type !== "inbox_item" ? (
              <div className="space-y-1.5">
                <label htmlFor="edit-assignee" className="text-sm font-medium">Assigned to</label>
                <select
                  id="edit-assignee"
                  name="assignedMemberId"
                  defaultValue={item.assignedMemberId ?? context.memberId}
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {members
                    .filter((member) => member.status === "active")
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.id === context.memberId ? "Me" : member.displayName}
                      </option>
                    ))}
                </select>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit">Save changes</Button>
              <Link href={returnPath} className={buttonVariants({ variant: "outline" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

function formatDateInput(value: Date | null | undefined) {
  return value ? value.toISOString().slice(0, 10) : "";
}
