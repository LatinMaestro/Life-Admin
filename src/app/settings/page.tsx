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
    { title: "Household name", detail: household.name, status: "Static state" },
    { title: "Timezone", detail: household.timezone, status: "Static state" },
    { title: "Current member", detail: currentMember.displayName, status: getRoleLabel(currentMember.role) },
    {
      title: "Settings access",
      detail: canManageHouseholdSettings(currentMember)
        ? "Current member is an admin in the static role model."
        : "Current member can view settings placeholders only.",
      status: canManageHouseholdSettings(currentMember) ? "Admin" : "Member",
    },
    { title: "Source references", detail: "Links and references only until uploads are approved.", status: "Deferred uploads" },
    { title: "Notifications", detail: "No notification integrations are enabled in Phase 3.", status: "Deferred" },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description={`Basic ${household.name} settings placeholders with static role-aware access labels.`}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Household settings</CardTitle>
            <CardDescription>Static configuration examples for the future settings workflow.</CardDescription>
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
                  ? "Admin-only member and role controls can attach here after sign-in is approved."
                  : "Member and role controls are reserved for household admins."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
