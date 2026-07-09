import "server-only";

import type { HouseholdAccessContext } from "@/lib/access-control";
import {
  requireHouseholdAccessContext,
  resolveHouseholdAccessContext,
} from "@/lib/server/household-access";

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  displayName?: string | null;
}

export interface AuthSession {
  user: AuthenticatedUser;
  activeHouseholdId?: string | null;
}

export class AuthenticationRequiredError extends Error {
  constructor(message = "Authentication is required for this action.") {
    super(message);
    this.name = "AuthenticationRequiredError";
  }
}

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  return null;
}

export async function requireCurrentAuthSession(): Promise<AuthSession> {
  const session = await getCurrentAuthSession();

  if (!session) {
    throw new AuthenticationRequiredError();
  }

  return session;
}

export async function getCurrentHouseholdAccessContext(): Promise<HouseholdAccessContext | null> {
  const session = await getCurrentAuthSession();

  if (!session) {
    return null;
  }

  return resolveHouseholdAccessContext({
    userId: session.user.id,
    householdId: session.activeHouseholdId,
  });
}

export async function requireCurrentHouseholdAccessContext(): Promise<HouseholdAccessContext> {
  const session = await requireCurrentAuthSession();

  return requireHouseholdAccessContext({
    userId: session.user.id,
    householdId: session.activeHouseholdId,
  });
}
