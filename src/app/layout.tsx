import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { AuthenticationProvider } from "@/components/authentication-provider";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";
import { getWorkspaceReadModel } from "@/lib/server/workspace-read-model";

export const metadata: Metadata = {
  title: "Family Life Admin",
  description: "Private household admin for shared family tasks, reminders, lists, bills, and source references.",
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const workspace = await getWorkspaceReadModel();
  const clerkEnabled = isClerkAuthenticationEnabled();

  return (
    <html lang="en">
      <body>
        <AuthenticationProvider clerkEnabled={clerkEnabled}>
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
        </AuthenticationProvider>
      </body>
    </html>
  );
}
