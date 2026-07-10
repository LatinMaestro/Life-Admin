"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { PropsWithChildren } from "react";

type AuthenticationProviderProps = PropsWithChildren<{
  clerkEnabled: boolean;
}>;

export function AuthenticationProvider({
  children,
  clerkEnabled,
}: AuthenticationProviderProps) {
  if (!clerkEnabled) {
    return children;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
