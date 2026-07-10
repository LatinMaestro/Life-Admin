import "server-only";

import {
  canManageHouseholdMembers,
  canManageHouseholdSettings,
  getRolePermissions,
  HouseholdAccessError,
} from "@/lib/access-control";
import type { HouseholdAccessContext, HouseholdPermission, HouseholdRole } from "@/lib/access-control";
import { getDemoHouseholdAccessContext } from "@/lib/server/demo-access-context";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";

type WorkspaceMember = {
  id: string;
  displayName: string;
  initials: string;
  role: HouseholdRole;
  roleLabel: string;
  status: "active" | "inactive";
  isCurrent: boolean;
};

type WorkspaceReadModel = {
  household: {
    id: string;
    name: string;
    timezone: string;
  };
  currentMember: WorkspaceMember;
  members: WorkspaceMember[];
  roleCapabilities: {
    key: HouseholdPermission;
    label: string;
  }[];
  access: {
    canManageSettings: boolean;
    canManageMembers: boolean;
  };
  sourcePosture: {
    total: number;
    sensitive: number;
    needsReview: number;
    billsAndRenewals: number;
  };
};

function formatRole(role: HouseholdRole) {
  return role === "household_admin" ? "Household admin" : "Household member";
}

function formatPermission(permission: HouseholdPermission) {
  const labels: Record<HouseholdPermission, string> = {
    view_household: "View this household workspace",
    manage_household_settings: "Manage household settings",
    manage_household_members: "Manage members and roles",
    manage_shared_items: "Create and update shared items",
    comment_on_items: "Comment on household items",
    view_source_references: "View source references",
  };

  return labels[permission];
}

export async function getWorkspaceReadModel(
  context: HouseholdAccessContext = getDemoHouseholdAccessContext(),
): Promise<WorkspaceReadModel> {
  const adapter = await getHouseholdPersistenceAdapter();
  const [household, memberRecords, sourceReferences, billsAndRenewals] = await Promise.all([
    adapter.getHousehold(context),
    adapter.listMembers(context),
    adapter.listSourceReferences(context),
    adapter.listBillsAndRenewals(context),
  ]);

  const members = memberRecords.map((member) => ({
    id: member.id,
    displayName: member.displayName,
    initials: member.initials ?? member.displayName.slice(0, 2).toUpperCase(),
    role: member.role,
    roleLabel: formatRole(member.role),
    status: member.status,
    isCurrent: member.id === context.memberId,
  }));
  const currentMember = members.find((member) => member.isCurrent);

  if (!currentMember) {
    throw new HouseholdAccessError("The current household member is not available.");
  }

  return {
    household: {
      id: household.id,
      name: household.name,
      timezone: household.timezone,
    },
    currentMember,
    members,
    roleCapabilities: getRolePermissions(context.role).map((permission) => ({
      key: permission,
      label: formatPermission(permission),
    })),
    access: {
      canManageSettings: canManageHouseholdSettings(context),
      canManageMembers: canManageHouseholdMembers(context),
    },
    sourcePosture: {
      total: sourceReferences.length,
      sensitive: sourceReferences.filter((source) => source.sensitivity === "sensitive").length,
      needsReview: sourceReferences.filter((source) => source.reviewStatus === "needs_review").length,
      billsAndRenewals: billsAndRenewals.length,
    },
  };
}
