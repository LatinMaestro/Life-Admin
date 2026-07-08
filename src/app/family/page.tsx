import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  getCurrentHouseholdBillReminders,
  getCurrentHouseholdInboxItems,
  getCurrentHouseholdReminders,
  getCurrentHouseholdShoppingLists,
  getCurrentHouseholdSourceReferences,
  getCurrentHouseholdTasks,
} from "@/lib/demo-data";
import {
  getCurrentHousehold,
  getCurrentHouseholdMembers,
  getCurrentMember,
  getHouseholdRoleDefinitions,
  getRoleCapabilityLabel,
  getRoleLabel,
  type HouseholdMember,
} from "@/lib/household";

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Brisbane",
  }).format(new Date(value));
}

function getMemberWorkload(member: HouseholdMember) {
  const tasks = getCurrentHouseholdTasks().filter((task) => task.assignedMemberId === member.id && task.status === "Open").length;
  const reminders = getCurrentHouseholdReminders().filter((reminder) => reminder.assignedMemberId === member.id).length;
  const bills = getCurrentHouseholdBillReminders().filter((bill) => bill.assignedMemberId === member.id).length;
  const inbox = getCurrentHouseholdInboxItems().filter((item) => item.assignedMemberId === member.id).length;
  const shopping = getCurrentHouseholdShoppingLists().reduce(
    (total, list) => total + list.items.filter((item) => !item.checked && (item.assignedMemberId ?? item.createdByMemberId) === member.id).length,
    0,
  );
  const sources = getCurrentHouseholdSourceReferences().filter((source) => source.createdByMemberId === member.id).length;

  return { tasks, reminders, bills, inbox, shopping, sources };
}

export default function FamilyPage() {
  const household = getCurrentHousehold();
  const currentMember = getCurrentMember();
  const familyMembers = getCurrentHouseholdMembers();
  const roleDefinitions = getHouseholdRoleDefinitions();
  const admins = familyMembers.filter((member) => member.role === "household_admin");
  const members = familyMembers.filter((member) => member.role === "household_member");

  return (
    <>
      <PageHeader
        title="Family"
        description={`Members, roles, and household access for ${household.name}.`}
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active members</CardDescription>
            <CardTitle className="text-2xl">{familyMembers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Household admins</CardDescription>
            <CardTitle className="text-2xl">{admins.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Household members</CardDescription>
            <CardTitle className="text-2xl">{members.length}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>{household.name}</CardTitle>
            <CardDescription>{familyMembers.length} active members in this household workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 xl:grid-cols-2">
              {familyMembers.map((member) => {
                const workload = getMemberWorkload(member);
                const activeTotal = workload.tasks + workload.reminders + workload.bills + workload.inbox + workload.shopping;

                return (
                  <article key={member.id} className="rounded-md border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-semibold text-accent-foreground">
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold leading-6">{member.displayName}</h2>
                            {member.id === currentMember.id ? <Badge>Current</Badge> : null}
                          </div>
                          <p className="text-sm leading-5 text-muted-foreground">{member.focusLabel}</p>
                        </div>
                      </div>
                      <Badge className="shrink-0">{getRoleLabel(member.role)}</Badge>
                    </div>

                    <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-md bg-muted/50 p-2">
                        <dt className="text-xs text-muted-foreground">Active</dt>
                        <dd className="text-lg font-semibold leading-6">{activeTotal}</dd>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2">
                        <dt className="text-xs text-muted-foreground">Sources</dt>
                        <dd className="text-lg font-semibold leading-6">{workload.sources}</dd>
                      </div>
                      <div className="rounded-md bg-muted/50 p-2">
                        <dt className="text-xs text-muted-foreground">Since</dt>
                        <dd className="text-xs font-medium leading-6">{formatJoinedDate(member.joinedAt)}</dd>
                      </div>
                    </dl>

                    <div className="mt-4">
                      <p className="text-sm font-medium leading-6">Responsibilities</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {member.responsibilities.map((responsibility) => (
                          <Badge key={responsibility}>{responsibility}</Badge>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Member access posture</CardTitle>
              <CardDescription>Static MVP access display before production authentication is approved.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="rounded-md border p-3">
                <p className="text-sm font-semibold leading-6">Household scoped</p>
                <p className="text-sm leading-5 text-muted-foreground">Every member and visible workload belongs to {household.name}.</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-sm font-semibold leading-6">Role ready</p>
                <p className="text-sm leading-5 text-muted-foreground">Admin and member roles are represented for future enforcement, without implementing login or invites.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
