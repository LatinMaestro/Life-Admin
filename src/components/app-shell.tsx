"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Home,
  Inbox,
  ListChecks,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import type { PropsWithChildren } from "react";
import { householdName } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Home", icon: Home },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/lists", label: "Lists", icon: ShoppingCart },
  { href: "/bills", label: "Bills", icon: ClipboardList },
  { href: "/family", label: "Family", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card px-4 py-5 lg:block">
        <Link href="/" className="block">
          <p className="text-sm font-medium text-muted-foreground">Family Life Admin</p>
          <p className="mt-1 text-lg font-semibold">{householdName}</p>
        </Link>
        <nav aria-label="Primary" className="mt-8 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/" className="block">
            <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
              Family Life Admin
            </p>
            <p className="text-base font-semibold">{householdName}</p>
          </Link>
        </header>

        <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {children}
        </main>
      </div>

      <nav
        aria-label="Mobile primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t bg-card px-2 pb-2 pt-1 shadow-lg lg:hidden"
      >
        <div className="grid grid-cols-7 gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[0.68rem] font-medium text-muted-foreground",
                  isActive && "bg-primary text-primary-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
