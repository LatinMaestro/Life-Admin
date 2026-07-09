import { Database, FileText, Mail, Mic, ShieldCheck, Smartphone, Sparkles, Upload, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemRow } from "@/components/item-row";
import { PageHeader } from "@/components/page-header";
import { getCurrentHouseholdBillReminders, getCurrentHouseholdSourceReferences } from "@/lib/demo-data";
import {
  canManageHouseholdMembers,
  canManageHouseholdSettings,
  getCurrentHousehold,
  getCurrentHouseholdMembers,
  getCurrentMember,
  getRoleCapabilityLabel,
  getRoleDefinition,
  getRoleLabel,
} from "@/lib/household";

export default function SettingsPage() {
  const household = getCurrentHousehold();
  const currentMember = getCurrentMember();
  const members = getCurrentHouseholdMembers();
  const sources = getCurrentHouseholdSourceReferences();
  const billReminders = getCurrentHouseholdBillReminders();
  const currentRole = getRoleDefinition(currentMember.role);
  const sensitiveSources = sources.filter((source) => source.sensitivity === "Sensitive");
  const reviewSources = sources.filter((source) => source.reviewStatus === "Needs review");
  const settings = [
    { title: "Household name", detail: household.name, status: "Active" },
    { title: "Timezone", detail: household.timezone, status: "Active" },
    { title: "Current member", detail: currentMember.displayName, status: getRoleLabel(currentMember.role) },
    { title: "Primary household", detail: "The MVP workspace is optimised around this household.", status: household.isPrimary ? "Primary" : "Available" },
    {
      title: "Settings access",
      detail: canManageHouseholdSettings(currentMember)
        ? "Current member can manage household settings."
        : "Current member can view household settings.",
      status: canManageHouseholdSettings(currentMember) ? "Admin" : "Member",
    },
    { title: "Manual capture", detail: "New household admin items start in the shared inbox.", status: "Active", href: "/inbox" },
    { title: "Source references", detail: "Original-source references are available from the source library.", status: `${sources.length} refs`, href: "/sources" },
    { title: "Activity trail", detail: "Comments and household activity stay scoped to this workspace.", status: "Active", href: "/activity" },
  ];
  const privacyPosture = [
    { title: "Household scope", detail: `${members.length} active members share this workspace.`, status: "Scoped" },
    { title: "Source privacy", detail: `${sensitiveSources.length} source references are marked sensitive.`, status: "Metadata" },
    { title: "Review queue", detail: `${reviewSources.length} source references need review from the original source.`, status: "Manual" },
    { title: "Bill reminders", detail: `${billReminders.length} admin reminders point back to source references.`, status: "Source-first" },
  ];
  const readinessItems = [
    { title: "Household workspace", detail: "Current-household state and member roles are represented in the static app.", status: "Ready", icon: UsersRound },
    { title: "Persistence", detail: "Database and Prisma work are still paused until the next approved phase.", status: "Deferred", icon: Database },
    { title: "Source uploads", detail: "The app uses source references only; uploads remain separately gated.", status: "Deferred", icon: Upload },
    { title: "Email intake", detail: "Forwarding and mailbox processing are not active in the MVP shell.", status: "Future", icon: Mail },
    { title: "AI and OCR", detail: "Extraction and classification are future phases with separate review gates.", status: "Future", icon: Sparkles },
    { title: "Voice and native iOS", detail: "Voice capture and native iOS wait until the web MVP is validated.", status: "Future", icon: Smartphone },
  ];

  return (
    <>
      <PageHeader
        title="Settings"
        description={`Basic ${household.name} settings and role-aware access.`}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Household settings</CardTitle>
              <CardDescription>Profile, access, and preference settings for the household.</CardDescription>
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
                  <CardDescription>Household boundaries and source-reference handling.</CardDescription>
                </div>
                <ShieldCheck className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              {privacyPosture.map((item) => (
                <ItemRow key={item.title} title={item.title} detail={item.detail} status={item.status} href={item.title === "Source privacy" ? "/sources" : undefined} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
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

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>MVP readiness</CardTitle>
                  <CardDescription>What is active in the static shell and what remains gated.</CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              {readinessItems.map((item) => {
                const Icon = item.icon === Smartphone ? Mic : item.icon;

                return (
                  <div key={item.title} className="flex gap-3 border-b py-3 last:border-b-0 last:pb-0 first:pt-0">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium leading-5">{item.title}</p>
                        <Badge variant="outline">{item.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
