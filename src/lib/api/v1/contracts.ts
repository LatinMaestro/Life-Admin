import type { HouseholdRole } from "@/lib/access-control";

export type MobileApiErrorCode =
  | "authentication_required"
  | "household_access_required"
  | "live_mode_required"
  | "unexpected_error";

export type MobileApiError = {
  error: {
    code: MobileApiErrorCode;
    message: string;
  };
};

export type MobileBootstrapResponse = {
  apiVersion: "1";
  generatedAt: string;
  household: {
    id: string;
    name: string;
    timezone: string;
  };
  currentMember: {
    id: string;
    displayName: string;
    initials: string;
    role: HouseholdRole;
  };
  members: Array<{
    id: string;
    displayName: string;
    initials: string;
    role: HouseholdRole;
  }>;
  counts: {
    inbox: number;
    tasks: number;
    reminders: number;
    shoppingItems: number;
    billsAndRenewals: number;
    sourceReferencesNeedingReview: number;
  };
  capabilities: {
    canManageHousehold: boolean;
    canManageMembers: boolean;
    canManageSharedItems: boolean;
    canViewSourceReferences: boolean;
  };
};
