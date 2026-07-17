import Link from "next/link";
import { ChevronRight, FileText, History, Pencil, Trash2, Users } from "lucide-react";
import { deleteAccountAction, updateHouseholdProfileAction } from "@/app/(workspace)/settings/actions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { householdTimezones } from "@/lib/server/household-settings";
import { getConfiguredPersistenceMode } from "@/lib/server/persistence";
import { getWorkspaceReadModel } from "@/lib/server/workspace-read-model";

const links = [
  { href: "/family", label: "Family", icon: Users },
  { href: "/sources", label: "Sources", icon: FileText },
  { href: "/activity", label: "Activity", icon: History },
];

type SettingsPageProps = {
  searchParams: Promise<{ profile?: string; account?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const [workspace, query] = await Promise.all([getWorkspaceReadModel(), searchParams]);
  const profileEditingEnabled =
    getConfiguredPersistenceMode() === "prisma" && workspace.access.canManageSettings;

  return (
    <>
      <PageHeader title="More" description="Household details and other sections." />

      <Card>
        <CardHeader>
          <CardTitle>{workspace.household.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b pb-3">
              <dt className="text-muted-foreground">Member</dt>
              <dd className="text-right font-medium">{workspace.currentMember.displayName}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b pb-3">
              <dt className="text-muted-foreground">Role</dt>
              <dd className="text-right font-medium">{workspace.currentMember.roleLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Timezone</dt>
              <dd className="text-right font-medium">{workspace.household.timezone.replace("Australia/", "")}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {profileEditingEnabled ? (
        <details id="household-profile" className="mt-4 scroll-mt-24 rounded-md border bg-card">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium">
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit household details
          </summary>
          <form action={updateHouseholdProfileAction} className="space-y-4 border-t p-4">
            {query.profile === "saved" ? (
              <p className="text-sm text-primary" role="status">Household details saved.</p>
            ) : null}
            {query.profile === "error" ? (
              <p className="text-sm text-destructive" role="alert">Check the household details.</p>
            ) : null}
            <div className="space-y-1.5">
              <label htmlFor="household-name" className="text-sm font-medium">Household name</label>
              <Input
                id="household-name"
                name="name"
                defaultValue={workspace.household.name}
                minLength={2}
                maxLength={80}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="household-timezone" className="text-sm font-medium">Timezone</label>
              <select
                id="household-timezone"
                name="timezone"
                defaultValue={workspace.household.timezone}
                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {householdTimezones.map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone.replace("Australia/", "")}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit">Save details</Button>
          </form>
        </details>
      ) : null}

      <details id="delete-account" className="mt-6 scroll-mt-24 rounded-md border border-destructive/40">
        <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium text-destructive">
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Delete account
        </summary>
        <form action={deleteAccountAction} className="space-y-4 border-t p-4">
          <p className="text-sm text-muted-foreground">
            This permanently removes your sign-in and anonymizes your personal household profile.
            Shared household history may remain under a former-member label.
          </p>
          <p className="text-sm text-muted-foreground">
            A sole household admin must appoint another admin first.
          </p>
          {query.account === "confirmation" ? (
            <p className="text-sm text-destructive" role="alert">Type DELETE exactly to confirm.</p>
          ) : null}
          {query.account === "blocked" ? (
            <p className="text-sm text-destructive" role="alert">
              The account could not be deleted. Check that every household has another admin, then try again.
            </p>
          ) : null}
          <div className="space-y-1.5">
            <label htmlFor="delete-confirmation" className="text-sm font-medium">
              Type DELETE
            </label>
            <Input
              id="delete-confirmation"
              name="confirmation"
              autoComplete="off"
              required
            />
          </div>
          <Button type="submit" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete my account</Button>
        </form>
      </details>

      <nav aria-label="More sections" className="mt-4 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex min-h-14 items-center gap-3 rounded-md border bg-card px-4 hover:bg-accent">
              <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
