export type HouseholdRole = "household_admin" | "household_member";

export type HouseholdPermission =
  | "view_household"
  | "manage_household_settings"
  | "manage_household_members"
  | "manage_shared_items"
  | "comment_on_items"
  | "view_source_references";

export interface HouseholdAccessContext {
  userId: string;
  householdId: string;
  memberId: string;
  role: HouseholdRole;
}

export class HouseholdAccessError extends Error {
  constructor(message = "Household access is not available for this member.") {
    super(message);
    this.name = "HouseholdAccessError";
  }
}

const rolePermissions: Record<HouseholdRole, HouseholdPermission[]> = {
  household_admin: [
    "view_household",
    "manage_household_settings",
    "manage_household_members",
    "manage_shared_items",
    "comment_on_items",
    "view_source_references",
  ],
  household_member: ["view_household", "manage_shared_items", "comment_on_items", "view_source_references"],
};

export function getRolePermissions(role: HouseholdRole) {
  return rolePermissions[role];
}

export function hasHouseholdPermission(context: HouseholdAccessContext, permission: HouseholdPermission) {
  return rolePermissions[context.role].includes(permission);
}

export function requireHouseholdPermission(context: HouseholdAccessContext | null | undefined, permission: HouseholdPermission) {
  if (!context || !hasHouseholdPermission(context, permission)) {
    throw new HouseholdAccessError();
  }

  return context;
}

export function requireHouseholdAdmin(context: HouseholdAccessContext | null | undefined) {
  return requireHouseholdPermission(context, "manage_household_settings");
}

export function createHouseholdScopedWhere(context: HouseholdAccessContext) {
  requireHouseholdPermission(context, "view_household");

  return { householdId: context.householdId } as const;
}

export function createMemberScopedAuditFields(context: HouseholdAccessContext) {
  requireHouseholdPermission(context, "view_household");

  return {
    householdId: context.householdId,
    createdByMemberId: context.memberId,
  } as const;
}

export function canManageHouseholdSettings(context: HouseholdAccessContext | null | undefined) {
  return Boolean(context && hasHouseholdPermission(context, "manage_household_settings"));
}

export function canManageHouseholdMembers(context: HouseholdAccessContext | null | undefined) {
  return Boolean(context && hasHouseholdPermission(context, "manage_household_members"));
}

export function canViewSourceReferences(context: HouseholdAccessContext | null | undefined) {
  return Boolean(context && hasHouseholdPermission(context, "view_source_references"));
}
