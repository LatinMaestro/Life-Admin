import { ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getWorkspaceReadModel } from "@/lib/server/workspace-read-model";

export default async function FamilyPage() {
  const workspace = await getWorkspaceReadModel();
  const activeMembers = workspace.members.filter((member) => member.status === "active");
  const adminCount = activeMembers.filter((member) => member.role === "household_admin").length;
  const memberCount = activeMembers.filter((member) => member.role === "household_member").length;

  return (
    <>
      <PageHeader
        title="Family"
        description={`Members, roles, and household access for ${workspace.household.name}.`}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active members", value: activeMembers.length, icon: UsersRound },
          { label: "Household admins", value: adminCount, icon: ShieldCheck },
          { label: "Household members", value: memberCount, icon: UserRound },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardContent className="flex min-h-24 items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl font-semibold leading-none">{item.value}</p>
                  <p className="mt-1 text-sm font-medium">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{workspace.household.name}</CardTitle>
            <CardDescription>{activeMembers.length} active people share this household workspace.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {activeMembers.map((member) => (
              <article key={member.id} className="rounded-md border bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold">{member.displayName}</h2>
                        {member.isCurrent ? <Badge variant="secondary">Current</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{member.roleLabel}</p>
                    </div>
                  </div>
                  <Badge variant={member.role === "household_admin" ? "default" : "outline"}>
                    {member.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simple household roles</CardTitle>
              <CardDescription>Two roles keep the MVP understandable and ready for future enforcement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <section className="border-b pb-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">Household admin</h2>
                  <Badge>{adminCount}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Coordinates shared work and can manage household settings and member roles.
                </p>
              </section>
              <section>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">Household member</h2>
                  <Badge variant="outline">{memberCount}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Participates in tasks, reminders, shopping, comments, and source-reference workflows.
                </p>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access posture</CardTitle>
              <CardDescription>Current workspace boundaries before production sign-in is introduced.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-md border p-3">
                <p className="text-sm font-semibold">Household scoped</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Members and visible records belong to {workspace.household.name}.
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-sm font-semibold">Multi-household ready</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The data boundary supports household selection while this MVP stays focused on one primary home.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
