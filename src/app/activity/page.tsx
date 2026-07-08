import Link from "next/link";
import { ArrowRight, History, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { getCommentEntityLabel, getCurrentHouseholdComments, getCurrentHouseholdOpenComments } from "@/lib/collaboration-data";
import { getCurrentHouseholdActivity } from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";

function getActivityEntityLabel(entityType: "bill" | "shopping_list" | "task") {
  const labels: Record<typeof entityType, string> = {
    bill: "Bill or renewal",
    shopping_list: "Shopping list",
    task: "Task",
  };

  return labels[entityType];
}

export default function ActivityPage() {
  const household = getCurrentHousehold();
  const comments = getCurrentHouseholdComments();
  const openComments = getCurrentHouseholdOpenComments();
  const activity = getCurrentHouseholdActivity();

  return (
    <>
      <PageHeader
        title="Activity"
        description={`Comments and household activity for ${household.name}, scoped to shared admin work.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            Capture item
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquareText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold leading-none">{comments.length}</p>
              <p className="text-sm font-medium">Comments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquareText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold leading-none">{openComments.length}</p>
              <p className="text-sm font-medium">Open notes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <History className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-2xl font-semibold leading-none">{activity.length}</p>
              <p className="text-sm font-medium">Activity events</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Household comments</CardTitle>
                <CardDescription>Shared notes attached to tasks, lists, bills, inbox items, and source references.</CardDescription>
              </div>
              <Badge>{openComments.length} open</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {comments.map((comment) => (
              <article key={comment.id} className="rounded-md border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold leading-6">{comment.entityTitle}</h2>
                    <p className="text-sm leading-5 text-muted-foreground">{comment.body}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{comment.status}</Badge>
                    <Badge>{getCommentEntityLabel(comment.entityType)}</Badge>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>{comment.visibility}</span>
                  <span>{getMemberDisplayName(comment.createdByMemberId)}</span>
                  <span>{comment.createdAtLabel}</span>
                </div>
                <Link href={comment.entityHref} className="mt-3 inline-flex text-sm font-medium text-primary">
                  View related item
                </Link>
              </article>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity trail</CardTitle>
              <CardDescription>Action summaries without copying private source contents.</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.map((event) => (
                <ItemRow
                  key={event.id}
                  title={event.summary}
                  detail={`Recorded by ${getMemberDisplayName(event.actorMemberId)}`}
                  status={getActivityEntityLabel(event.entityType)}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy posture</CardTitle>
              <CardDescription>Activity should explain what changed without repeating sensitive document contents.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-md border p-3">
                <p className="text-sm font-semibold leading-6">Household scoped</p>
                <p className="text-sm leading-5 text-muted-foreground">Comments and events belong to the active household workspace.</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-sm font-semibold leading-6">Source safe</p>
                <p className="text-sm leading-5 text-muted-foreground">Source references stay as pointers to originals, not copied source text.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
