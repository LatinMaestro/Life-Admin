import Link from "next/link";
import { FileText, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentHouseholdSourceReferences,
  getSourceKindLabel,
  getSourceReviewStatusLabel,
  getSourceSensitivityLabel,
} from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";
import { cn } from "@/lib/utils";

export default function SourcesPage() {
  const household = getCurrentHousehold();
  const sourceReferences = getCurrentHouseholdSourceReferences();
  const documentReferences = sourceReferences.filter((source) => source.kind === "source_document_reference");
  const linkReferences = sourceReferences.filter((source) => source.kind === "source_link");
  const needsReview = sourceReferences.filter((source) => source.reviewStatus === "Needs review");
  const sensitiveReferences = sourceReferences.filter((source) => source.sensitivity === "Sensitive");

  return (
    <>
      <PageHeader
        title="Sources"
        description={`Saved source references for ${household.name} household admin items.`}
        action={
          <Link href="/inbox" className={buttonVariants()}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Capture source
          </Link>
        }
      />

      <section className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total references</CardDescription>
            <CardTitle className="text-2xl">{sourceReferences.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Document refs</CardDescription>
            <CardTitle className="text-2xl">{documentReferences.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Source links</CardDescription>
            <CardTitle className="text-2xl">{linkReferences.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Need review</CardDescription>
            <CardTitle className="text-2xl">{needsReview.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Source handling rules</CardTitle>
              <CardDescription>References identify the original source without copying private document contents into the app.</CardDescription>
            </div>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Metadata only</p>
              <p className="text-sm leading-5 text-muted-foreground">Store title, kind, owner, status, linked area, and handling notes only.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Open original</p>
              <p className="text-sm leading-5 text-muted-foreground">Use the original source before acting on a bill, renewal, task, or reminder.</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm font-semibold leading-6">Keep notes high level</p>
              <p className="text-sm leading-5 text-muted-foreground">Activity and comments should describe actions without duplicating sensitive source contents.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Reference library</CardTitle>
              <CardDescription>Household-scoped references linked to inbox items, reminders, bills, and renewals.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Metadata only</Badge>
              <Badge>{sensitiveReferences.length} sensitive</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 lg:grid-cols-2">
            {sourceReferences.map((source) => (
              <article key={source.id} className="rounded-md border p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-background">
                    <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge>{getSourceKindLabel(source.kind)}</Badge>
                      <Badge>{source.label}</Badge>
                      <Badge>{getSourceReviewStatusLabel(source.reviewStatus)}</Badge>
                    </div>
                    <h2 className="text-base font-semibold leading-6">{source.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Added by {getMemberDisplayName(source.createdByMemberId)}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium">Linked area</dt>
                    <dd className="text-muted-foreground">{source.linkedArea}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Sensitivity</dt>
                    <dd className="text-muted-foreground">{getSourceSensitivityLabel(source.sensitivity)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Last reviewed</dt>
                    <dd className="text-muted-foreground">{source.lastReviewedLabel}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Status</dt>
                    <dd className="text-muted-foreground">{source.reviewStatus}</dd>
                  </div>
                </dl>

                <div className="mt-4 rounded-md bg-muted/50 p-3">
                  <p className="text-sm font-medium leading-6">Handling note</p>
                  <p className="text-sm leading-5 text-muted-foreground">{source.handlingNotes}</p>
                </div>

                <Link href={source.relatedHref} className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}>
                  View related item
                </Link>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
