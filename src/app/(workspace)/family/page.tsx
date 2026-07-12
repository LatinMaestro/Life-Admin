import { Plus } from "lucide-react";
import { createHouseholdInvitationAction } from "@/app/(workspace)/family/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/page-header";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";
import {
  listPendingHouseholdInvitations,
  type PendingHouseholdInvitation,
} from "@/lib/server/household-invitations";
import { getConfiguredPersistenceMode } from "@/lib/server/persistence";
import { getWorkspaceReadModel } from "@/lib/server/workspace-read-model";

type FamilyPageProps = {
  searchParams: Promise<{ invite?: string }>;
};

const inviteMessages: Record<string, string> = {
  sent: "Invitation ready. Ask them to sign in with that email.",
  invalid: "Enter a valid email and role.",
  member: "That person is already in this household.",
  error: "The invitation could not be created. Please try again.",
};

export default async function FamilyPage({ searchParams }: FamilyPageProps) {
  const workspace = await getWorkspaceReadModel();
  const members = workspace.members.filter((member) => member.status === "active");
  const invitationEnabled =
    getConfiguredPersistenceMode() === "prisma" && workspace.access.canManageMembers;
  const invitations: PendingHouseholdInvitation[] = invitationEnabled
    ? await listPendingHouseholdInvitations(await getRuntimeHouseholdAccessContext())
    : [];
  const { invite } = await searchParams;

  return (
    <>
      <PageHeader
        title="Family"
        description={`People in ${workspace.household.name}.`}
      />

      <Card>
        <CardHeader>
          <CardTitle>{members.length} {members.length === 1 ? "member" : "members"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                  {member.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{member.displayName}</p>
                  <p className="text-sm text-muted-foreground">{member.roleLabel}</p>
                </div>
              </div>
              {member.isCurrent ? <Badge variant="secondary">You</Badge> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      {invitationEnabled ? (
        <details className="rounded-md border bg-card">
          <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Invite family member
          </summary>
          <div className="space-y-4 border-t p-4">
            {invite && inviteMessages[invite] ? (
              <p
                className={invite === "sent" ? "text-sm text-primary" : "text-sm text-destructive"}
                role="status"
              >
                {inviteMessages[invite]}
              </p>
            ) : null}
            <form action={createHouseholdInvitationAction} className="space-y-3">
              <div className="space-y-1.5">
                <label htmlFor="invite-email" className="text-sm font-medium">Email</label>
                <Input id="invite-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="invite-role" className="text-sm font-medium">Role</label>
                <select
                  id="invite-role"
                  name="role"
                  defaultValue="household_member"
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="household_member">Household member</option>
                  <option value="household_admin">Household admin</option>
                </select>
              </div>
              <p className="text-sm text-muted-foreground">
                They can join by signing in with this email. The invitation expires after 14 days.
              </p>
              <Button type="submit">Create invitation</Button>
            </form>

            {invitations.length > 0 ? (
              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Waiting to join</p>
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">{invitation.invitedEmail}</span>
                    <Badge variant="secondary">
                      {invitation.role === "household_admin" ? "Admin" : "Member"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </details>
      ) : null}
    </>
  );
}
