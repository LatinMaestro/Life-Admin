import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { householdName } from "@/lib/demo-data";

const settings = [
  { title: "Household name", detail: householdName, status: "Placeholder" },
  { title: "Timezone", detail: "Australia/Brisbane", status: "Placeholder" },
  { title: "Source references", detail: "Links and references only until uploads are approved.", status: "Deferred uploads" },
  { title: "Notifications", detail: "No notification integrations are enabled in Phase 1.", status: "Deferred" },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Basic household settings placeholders. Authentication, uploads, notifications, and integrations remain deferred."
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
