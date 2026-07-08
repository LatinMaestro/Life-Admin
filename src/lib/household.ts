export type HouseholdRole = "household_admin" | "household_member";

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
  joinedAt: string;
}

export const memberIds = {
  alex: "member_alex",
  morgan: "member_morgan",
  jordan: "member_jordan",
  taylor: "member_taylor",
} as const;

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
    joinedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: memberIds.morgan,
    householdId: currentHousehold.id,
    displayName: "Morgan",
    role: "household_admin",
    status: "active",
    initials: "MO",
    joinedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    id: memberIds.jordan,
    householdId: currentHousehold.id,
    displayName: "Jordan",
    role: "household_member",
    status: "active",
    initials: "JO",
    joinedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    id: memberIds.taylor,
    householdId: currentHousehold.id,
    displayName: "Taylor",
    role: "household_member",
    status: "active",
    initials: "TA",
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

export function getRoleLabel(role: HouseholdRole) {
  if (role === "household_admin") {
    return "Household admin";
  }

  return "Household member";
}
