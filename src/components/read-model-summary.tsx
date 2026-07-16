import Link from "next/link";
import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { buttonVariants } from "@/components/ui/button";

type ReadModelCount = {
  label: string;
  value: number;
};

export type ReadModelRow = {
  id: string;
  title: string;
  detail: string;
  status: string;
  href: string;
  entityType?: "inbox_item" | "task" | "reminder" | "bill_or_renewal";
};

interface ReadModelSummaryProps {
  title: string;
  description: string;
  counts: ReadModelCount[];
  rows: ReadModelRow[];
  emptyLabel: string;
  actionHref?: string;
  actionLabel?: string;
  renderAction?: (row: ReadModelRow) => ReactNode;
  allowEditing?: boolean;
}

export function ReadModelSummary({
  title,
  description,
  counts,
  rows,
  emptyLabel,
  renderAction,
  allowEditing = false,
}: ReadModelSummaryProps) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {counts.map((count) => (
            <div key={count.label} className="flex items-baseline gap-2">
              <dd className="text-lg font-semibold">{count.value}</dd>
              <dt className="text-muted-foreground">{count.label}</dt>
            </div>
          ))}
        </dl>
      </CardHeader>
      <CardContent>
        {rows.length > 0 ? (
          <div className="divide-y">
            {rows.map((row) => (
              <ItemRow
                key={row.id}
                title={row.title}
                detail={row.detail}
                status={row.status}
                href={row.href.startsWith("https://") ? row.href : undefined}
                action={
                  allowEditing && row.entityType ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/edit/${row.entityType}/${row.id}`}
                        className={buttonVariants({ variant: "outline", size: "icon" })}
                        title="Edit"
                        aria-label={`Edit ${row.title}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      {renderAction?.(row)}
                    </div>
                  ) : (
                    renderAction?.(row)
                  )
                }
              />
            ))}
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">{emptyLabel}</p>
        )}
      </CardContent>
    </Card>
  );
}
