export type HouseholdRole = "household_admin" | "household_member";

export type RoleCapability =
  | "manage_household_settings"
  | "manage_household_members"
  | "manage_shared_items"
  | "comment_on_items"
  | "view_source_references";

export interface Household {
  id: string;
  name: string;
  timezone: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  displayName: string;
  role: HouseholdRole;
  status: "active";
  initials: string;
  focusLabel: string;
  responsibilities: string[];
  joinedAt: string;
}

export interface RoleDefinition {
  role: HouseholdRole;
  label: string;
  summary: string;
  capabilities: RoleCapability[];
}

export const memberIds = {
  alex: "member_alex",
  morgan: "member_morgan",
  jordan: "member_jordan",
  taylor: "member_taylor",
} as const;

const roleDefinitions: Record<HouseholdRole, RoleDefinition> = {
  household_admin: {
    role: "household_admin",
    label: "Household admin",
    summary: "Can manage the household profile, member roles, and shared household admin items.",
    capabilities: [
      "manage_household_settings",
      "manage_household_members",
      "manage_shared_items",
      "comment_on_items",
      "view_source_references",
    ],
  },
  household_member: {
    role: "household_member",
    label: "Household member",
    summary: "Can participate in shared household tasks, lists, reminders, comments, and source references.",
    capabilities: ["manage_shared_items", "comment_on_items", "view_source_references"],
  },
};

const currentHousehold: Household = {
  id: "household_rivergum",
  name: "Rivergum Household",
  timezone: "Australia/Brisbane",
  isPrimary: true,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-08T00:00:00.000Z",
};

const householdMembers: HouseholdMember[] = [
  {
    id: memberIds.alex,
    householdId: currentHousehold.id,
    displayName: "Alex",
    role: "household_admin",
    status: "active",
    initials: "AL",
    focusLabel: "Household coordination",
    responsibilities: ["Inbox triage", "Bills and renewals", "Source references"],
    joinedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: memberIds.morgan,
    householdId: currentHousehold.id,
    displayName: "Morgan",
    role: "household_admin",
    status: "active",
    initials: "MO",
    focusLabel: "Shared reminders",
    responsibilities: ["Appointments", "Shopping lists", "Household notes"],
    joinedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: memberIds.jordan,
    householdId: currentHousehold.id,
    displayName: "Jordan",
    role: "household_member",
    status: "active",
    initials: "JO",
    focusLabel: "Everyday tasks",
    responsibilities: ["Quick tasks", "Home supplies", "Renewal checks"],
    joinedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: memberIds.taylor,
    householdId: currentHousehold.id,
    displayName: "Taylor",
    role: "household_member",
    status: "active",
    initials: "TA",
    focusLabel: "List participation",
    responsibilities: ["Shopping updates", "Personal tasks", "Household comments"],
    joinedAt: "2026-07-02T00:00:00.000Z",
  },
];

const currentMemberId = memberIds.alex;

export function getCurrentHousehold() {
  return currentHousehold;
}

export function getCurrentHouseholdMembers() {
  return householdMembers.filter((member) => member.householdId === currentHousehold.id);
}

export function getCurrentMember() {
  return getCurrentHouseholdMembers().find((member) => member.id === currentMemberId) ?? householdMembers[0];
}

export function getMemberById(memberId: string | null | undefined) {
  if (!memberId) {
    return undefined;
  }

  return getCurrentHouseholdMembers().find((member) => member.id === memberId);
}

export function getMemberDisplayName(memberId: string | null | undefined) {
  return getMemberById(memberId)?.displayName ?? "Household";
}

export function getRoleDefinition(role: HouseholdRole) {
  return roleDefinitions[role];
}

export function getHouseholdRoleDefinitions() {
  return [roleDefinitions.household_admin, roleDefinitions.household_member];
}

export function getRoleLabel(role: HouseholdRole) {
  return getRoleDefinition(role).label;
}

export function getRoleCapabilityLabel(capability: RoleCapability) {
  const labels: Record<RoleCapability, string> = {
    manage_household_settings: "Manage household settings",
    manage_household_members: "Manage members and roles",
    manage_shared_items: "Create and update shared items",
    comment_on_items: "Comment on household items",
    view_source_references: "View source references",
  };

  return labels[capability];
}

export function canManageHouseholdSettings(member: HouseholdMember) {
  return member.role === "household_admin";
}

export function canManageHouseholdMembers(member: HouseholdMember) {
  return member.role === "household_admin";
}
