import type { Metadata } from "next";
import type { PropsWithChildren } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Family Life Admin",
  description: "Private household admin for shared family tasks, reminders, lists, bills, and source references.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
