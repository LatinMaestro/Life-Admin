import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import {
  canManageHouseholdMembers,
  canManageHouseholdSettings,
  getCurrentHousehold,
  getCurrentMember,
  getRoleCapabilityLabel,
  getRoleDefinition,
  getRoleLabel,
} from "@/lib/household";

export default function SettingsPage() {
  const household = getCurrentHousehold();
  const currentMember = getCurrentMember();
  const currentRole = getRoleDefinition(currentMember.role);
  const settings = [
    { title: "Household name", detail: household.name, status: "Active" },
    { title: "Timezone", detail: household.timezone, status: "Active" },
    { title: "Current member", detail: currentMember.displayName, status: getRoleLabel(currentMember.role) },
    {
      title: "Settings access",
      detail: canManageHouseholdSettings(currentMember)
        ? "Current member can manage household settings."
        : "Current member can view household settings.",
      status: canManageHouseholdSettings(currentMember) ? "Admin" : "Member",
    },
    { title: "Source references", detail: "Links and references are available from the source library.", status: "Enabled" },
    { title: "Notifications", detail: "Reminder preferences will appear here when enabled.", status: "Planned" },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description={`Basic ${household.name} settings and role-aware access.`}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Household settings</CardTitle>
            <CardDescription>Profile, access, and preference settings for the household.</CardDescription>
          </CardHeader>
          <CardContent>
            {settings.map((item) => (
              <ItemRow key={item.title} title={item.title} detail={item.detail} status={item.status} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Current role</CardTitle>
                <CardDescription>{currentRole.summary}</CardDescription>
              </div>
              <Badge>{currentRole.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium leading-6">Role capabilities</p>
              <ul className="mt-2 space-y-2">
                {currentRole.capabilities.map((capability) => (
                  <li key={capability} className="text-sm leading-5 text-muted-foreground">
                    {getRoleCapabilityLabel(capability)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm font-medium leading-6">Member management</p>
              <p className="text-sm leading-5 text-muted-foreground">
                {canManageHouseholdMembers(currentMember)
                  ? "Admin member and role controls belong here."
                  : "Member and role controls are reserved for household admins."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
