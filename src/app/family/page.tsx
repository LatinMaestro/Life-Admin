import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentHousehold,
  getCurrentHouseholdMembers,
  getCurrentMember,
  getHouseholdRoleDefinitions,
  getRoleCapabilityLabel,
  getRoleLabel,
} from "@/lib/household";

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  }).format(new Date(value));
}

export default function FamilyPage() {
  const household = getCurrentHousehold();
  const currentMember = getCurrentMember();
  const familyMembers = getCurrentHouseholdMembers();
  const roleDefinitions = getHouseholdRoleDefinitions();

  return (
    <>
      <PageHeader
        title="Family"
        description={`Members, roles, and household access for ${household.name}.`}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>{household.name}</CardTitle>
            <CardDescription>{familyMembers.length} active members in this household workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {familyMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex min-h-16 items-start justify-between gap-3 border-b py-3 last:border-b-0"
                >
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">
                      {member.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium leading-6">{member.displayName}</p>
                        {member.id === currentMember.id ? <Badge>Current</Badge> : null}
                      </div>
                      <p className="text-sm leading-5 text-muted-foreground">
                        Active since {formatJoinedDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge className="shrink-0">{getRoleLabel(member.role)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role model</CardTitle>
            <CardDescription>What each household role can do.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roleDefinitions.map((definition) => (
              <section key={definition.role} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold leading-6">{definition.label}</h2>
                    <p className="text-sm leading-5 text-muted-foreground">{definition.summary}</p>
                  </div>
                  <Badge>{definition.capabilities.length} permissions</Badge>
                </div>
                <ul className="mt-3 space-y-2">
                  {definition.capabilities.map((capability) => (
                    <li key={capability} className="text-sm leading-5 text-muted-foreground">
                      {getRoleCapabilityLabel(capability)}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
