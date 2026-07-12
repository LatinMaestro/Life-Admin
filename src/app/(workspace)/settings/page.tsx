import Link from "next/link";
import { ChevronRight, FileText, History, Users } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkspaceReadModel } from "@/lib/server/workspace-read-model";

const links = [
  { href: "/family", label: "Family", icon: Users },
  { href: "/sources", label: "Sources", icon: FileText },
  { href: "/activity", label: "Activity", icon: History },
];

export default async function SettingsPage() {
  const workspace = await getWorkspaceReadModel();

  return (
    <>
      <PageHeader title="More" description="Household details and other sections." />

      <Card>
        <CardHeader>
          <CardTitle>{workspace.household.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b pb-3">
              <dt className="text-muted-foreground">Member</dt>
              <dd className="text-right font-medium">{workspace.currentMember.displayName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-right font-medium">{workspace.currentMember.roleLabel}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <nav aria-label="More sections" className="mt-4 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex min-h-14 items-center gap-3 rounded-md border bg-card px-4 hover:bg-accent">
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
