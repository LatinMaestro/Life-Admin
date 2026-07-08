import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ItemRowProps {
  title: string;
  detail: string;
  status?: string;
  href?: string;
}

export function ItemRow({ title, detail, status, href }: ItemRowProps) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-6">{title}</p>
        <p className="text-sm leading-5 text-muted-foreground">{detail}</p>
      </div>
      {status ? <Badge className="shrink-0">{status}</Badge> : null}
    </>
  );

  const className = "flex min-h-16 items-start justify-between gap-3 border-b py-3 last:border-b-0";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          className,
          "-mx-2 rounded-md px-2 transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}
