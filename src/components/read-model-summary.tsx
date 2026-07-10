import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";

type ReadModelCount = {
  label: string;
  value: number;
};

type ReadModelRow = {
  id: string;
  title: string;
  detail: string;
  status: string;
  href: string;
};

interface ReadModelSummaryProps {
  title: string;
  description: string;
  counts: ReadModelCount[];
  rows: ReadModelRow[];
  emptyLabel: string;
  actionHref?: string;
  actionLabel?: string;
}

export function ReadModelSummary({
  title,
  description,
  counts,
  rows,
  emptyLabel,
  actionHref,
  actionLabel = "Open",
}: ReadModelSummaryProps) {
  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {actionHref ? (
              <Link
                href={actionHref}
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {actionLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {counts.map((count) => (
              <div key={count.label} className="rounded-md border bg-background p-3">
                <p className="text-2xl font-semibold leading-none">{count.value}</p>
                <p className="mt-1 text-sm font-medium">{count.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Latest items</CardTitle>
              <CardDescription>Household items in this section.</CardDescription>
            </div>
            <Badge>{rows.length} items</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            rows.map((row) => (
              <ItemRow key={row.id} title={row.title} detail={row.detail} status={row.status} href={row.href} />
            ))
          ) : (
            <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">{emptyLabel}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
