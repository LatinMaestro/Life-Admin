import { Clock3, FileText, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { getWorkspaceReadModel } from "@/lib/server/workspace-read-model";

export default async function SettingsPage() {
  const workspace = await getWorkspaceReadModel();
  const settings = [
    { title: "Household name", detail: workspace.household.name, status: "Active" },
    { title: "Timezone", detail: workspace.household.timezone, status: "Active" },
    {
      title: "Current member",
      detail: workspace.currentMember.displayName,
      status: workspace.currentMember.roleLabel,
    },
    {
      title: "Household access",
      detail: workspace.access.canManageSettings
        ? "This member can manage household settings."
        : "This member can view household settings.",
      status: workspace.access.canManageSettings ? "Admin" : "Member",
    },
    {
      title: "Member management",
      detail: workspace.access.canManageMembers
        ? "Member and role management is available to this role."
        : "Member and role management is reserved for household admins.",
      status: workspace.access.canManageMembers ? "Admin" : "View only",
      href: "/family",
    },
    {
      title: "Manual capture",
      detail: "New household admin items start in the shared inbox.",
      status: "Active",
      href: "/inbox",
    },
  ];
  const privacyPosture = [
    {
      title: "Household scope",
      detail: `${workspace.members.length} active members share this workspace.`,
      status: "Scoped",
    },
    {
      title: "Source library",
      detail: `${workspace.sourcePosture.total} private source references are available.`,
      status: "References",
      href: "/sources",
    },
    {
      title: "Sensitive sources",
      detail: `${workspace.sourcePosture.sensitive} references are marked sensitive.`,
      status: "Private",
      href: "/sources",
    },
    {
      title: "Review queue",
      detail: `${workspace.sourcePosture.needsReview} references need confirmation from the original source.`,
      status: "Manual",
      href: "/sources",
    },
    {
      title: "Bills and renewals",
      detail: `${workspace.sourcePosture.billsAndRenewals} admin reminders follow the source-first workflow.`,
      status: "Source first",
      href: "/bills",
    },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description={`Household profile, access, and privacy for ${workspace.household.name}.`}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Household settings</CardTitle>
                  <CardDescription>Profile and access details for the active household.</CardDescription>
                </div>
                <Clock3 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              {settings.map((item) => (
                <ItemRow key={item.title} title={item.title} detail={item.detail} status={item.status} href={item.href} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Privacy posture</CardTitle>
                  <CardDescription>Household boundaries and original-source handling.</CardDescription>
                </div>
                <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              {privacyPosture.map((item) => (
                <ItemRow key={item.title} title={item.title} detail={item.detail} status={item.status} href={item.href} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{workspace.currentMember.roleLabel}</CardTitle>
                  <CardDescription>Current permissions in this household workspace.</CardDescription>
                </div>
                <Badge>{workspace.currentMember.displayName}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {workspace.roleCapabilities.map((capability) => (
                <div key={capability.key} className="flex min-h-11 items-center gap-3 rounded-md border px-3 py-2">
                  <LockKeyhole className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm">{capability.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workspace status</CardTitle>
              <CardDescription>The current household experience remains private and manual-first.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex gap-3 rounded-md border p-3">
                <UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">One primary household</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The interface stays focused while the architecture remains ready for more households later.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-md border p-3">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Original sources stay authoritative</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Household reminders point back to private source references for confirmation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
