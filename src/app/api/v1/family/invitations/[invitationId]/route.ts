import { requireId } from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import {
  HouseholdInvitationError,
  revokeHouseholdInvitation,
} from "@/lib/server/household-invitations";

export const dynamic = "force-dynamic";

export function DELETE(
  _request: Request,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const { invitationId } = await params;
    try {
      await revokeHouseholdInvitation(context, requireId(invitationId));
    } catch (error) {
      if (error instanceof HouseholdInvitationError) {
        throw new MobileApiRequestError(error.message);
      }
      throw error;
    }
    return { apiVersion: "1" as const, generatedAt: new Date().toISOString(), success: true as const };
  });
}
