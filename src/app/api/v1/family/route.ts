import { readJsonObject, requireEnum, requireText } from "@/lib/api/v1/input";
import type { MobileFamilyResponse } from "@/lib/api/v1/contracts";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import {
  createHouseholdInvitation,
  HouseholdInvitationError,
  listPendingHouseholdInvitations,
} from "@/lib/server/household-invitations";

export const dynamic = "force-dynamic";

const roles = ["household_admin", "household_member"] as const;

function envelope() {
  return { apiVersion: "1" as const, generatedAt: new Date().toISOString() };
}

export function GET() {
  return withHouseholdApi(async (context): Promise<MobileFamilyResponse> => {
    const invitations =
      context.role === "household_admin"
        ? await listPendingHouseholdInvitations(context)
        : [];
    return {
      ...envelope(),
      invitations: invitations.map((item) => ({
        ...item,
        expiresAt: item.expiresAt?.toISOString() ?? null,
      })),
    };
  });
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const email = requireText(input, "email", 3, 254).toLowerCase();
    const role = requireEnum(input, "role", roles);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new MobileApiRequestError("Enter a valid email address.");
    }
    try {
      await createHouseholdInvitation(context, email, role);
    } catch (error) {
      if (error instanceof HouseholdInvitationError) {
        throw new MobileApiRequestError(error.message);
      }
      throw error;
    }
    return { ...envelope(), success: true as const };
  });
}
