import type { Metadata, Viewport } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import { AuthenticationProvider } from "@/components/authentication-provider";
import { isClerkAuthenticationEnabled } from "@/lib/auth/config";

export const metadata: Metadata = {
  applicationName: "Family Life Admin",
  title: {
    default: "Family Life Admin",
    template: "%s | Family Life Admin",
  },
  description: "Private household admin for shared family tasks, reminders, lists, bills, and source references.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Life Admin",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#28745f",
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
