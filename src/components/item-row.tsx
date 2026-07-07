import { Badge } from "@/components/ui/badge";

interface ItemRowProps {
  title: string;
  detail: string;
  status?: string;
}

export function ItemRow({ title, detail, status }: ItemRowProps) {
  return (
    <div className="flex min-h-16 items-start justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-6">{title}</p>
        <p className="text-sm leading-5 text-muted-foreground">{detail}</p>
      </div>
      {status ? <Badge className="shrink-0">{status}</Badge> : null}
    </div>
  );
}
