import type { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app-shell";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";
import { getWorkspaceReadModel } from "@/lib/server/workspace-read-model";

export default async function WorkspaceLayout({ children }: PropsWithChildren) {
  const clerkEnabled = isClerkAuthenticationEnabled();
  const accessContext = clerkEnabled
    ? await getVerifiedClerkHouseholdAccess()
    : undefined;
  const workspace = await getWorkspaceReadModel(accessContext);

  return (
    <AppShell
      household={{
        name: workspace.household.name,
        timezone: workspace.household.timezone,
      }}
      currentMember={{
        displayName: workspace.currentMember.displayName,
        roleLabel: workspace.currentMember.roleLabel,
      }}
    >
      {children}
    </AppShell>
  );
}

async function getVerifiedClerkHouseholdAccess() {
  await auth.protect();

  const { getCurrentHouseholdAccessContext } = await import("@/lib/auth/session");
  const accessContext = await getCurrentHouseholdAccessContext();

  if (!accessContext) {
    redirect("/access-pending");
  }

  return accessContext;
}
