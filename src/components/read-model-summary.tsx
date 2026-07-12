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
