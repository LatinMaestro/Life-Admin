import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import { AuthenticationProvider } from "@/components/authentication-provider";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";

export const metadata: Metadata = {
  title: "Family Life Admin",
  description: "Private household admin for shared family tasks, reminders, lists, bills, and source references.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  const clerkEnabled = isClerkAuthenticationEnabled();

  return (
    <html lang="en">
      <body>
        <AuthenticationProvider clerkEnabled={clerkEnabled}>
          {children}
        </AuthenticationProvider>
      </body>
    </html>
  );
}
