import { readJsonObject, requireEnum, requireId } from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import {

export const dynamic = "force-dynamic";
  deactivateHouseholdMember,
  HouseholdInvitationError,
  updateHouseholdMemberRole,
} from "@/lib/server/household-invitations";

const roles = ["household_admin", "household_member"] as const;

export function PATCH(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const [{ memberId }, input] = await Promise.all([params, readJsonObject(request)]);
    const id = requireId(memberId);
    const operation = requireEnum(input, "operation", ["role", "remove"] as const);
    try {
      if (operation === "remove") {
        await deactivateHouseholdMember(context, id);
      } else {
        await updateHouseholdMemberRole(context, id, requireEnum(input, "role", roles));
      }
    } catch (error) {
      if (error instanceof HouseholdInvitationError) {
        throw new MobileApiRequestError(error.message);
      }
      throw error;
    }
    return { apiVersion: "1" as const, generatedAt: new Date().toISOString(), success: true as const };
  });
}
