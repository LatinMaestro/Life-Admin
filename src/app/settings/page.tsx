import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { getCurrentHousehold, getCurrentMember, getRoleLabel } from "@/lib/household";


export default function SettingsPage() {
  const household = getCurrentHousehold();
  const currentMember = getCurrentMember();
  const settings = [
    { title: "Household name", detail: household.name, status: "Static state" },
    { title: "Timezone", detail: household.timezone, status: "Static state" },
    { title: "Current member", detail: currentMember.displayName, status: getRoleLabel(currentMember.role) },
    { title: "Source references", detail: "Links and references only until uploads are approved.", status: "Deferred uploads" },
    { title: "Notifications", detail: "No notification integrations are enabled in Phase 2.", status: "Deferred" },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description={`Basic ${household.name} settings placeholders. Authentication, uploads, notifications, and integrations remain deferred.`}
      />

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
    </>
  );
}
