import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getCurrentHouseholdSourceReferences, getSourceKindLabel } from "@/lib/demo-data";
import { getCurrentHousehold, getMemberDisplayName } from "@/lib/household";
import { cn } from "@/lib/utils";

export default function SourcesPage() {
  const household = getCurrentHousehold();
  const sourceReferences = getCurrentHouseholdSourceReferences();
  const documentReferences = sourceReferences.filter((source) => source.kind === "source_document_reference");
  const linkReferences = sourceReferences.filter((source) => source.kind === "source_link");

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

      <section className="grid gap-3 sm:grid-cols-3">
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
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Reference library</CardTitle>
              <CardDescription>Household-scoped references linked to inbox items, reminders, bills, and renewals.</CardDescription>
            </div>
            <Badge>Metadata only</Badge>
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
                    </div>
                    <h2 className="text-base font-semibold leading-6">{source.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Added by {getMemberDisplayName(source.createdByMemberId)}
                    </p>
                  </div>
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
