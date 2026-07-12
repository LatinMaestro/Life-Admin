import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getWorkspaceReadModel } from "@/lib/server/workspace-read-model";

export default async function FamilyPage() {
  const workspace = await getWorkspaceReadModel();
  const members = workspace.members.filter((member) => member.status === "active");

  return (
    <>
      <PageHeader
        title="Family"
        description={`People in ${workspace.household.name}.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>{members.length} {members.length === 1 ? "member" : "members"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                  {member.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.displayName}</p>
                  <p className="text-sm text-muted-foreground">{member.roleLabel}</p>
                </div>
              </div>
              {member.isCurrent ? <Badge variant="secondary">You</Badge> : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
