import { readJsonObject, requireEnum, requireText } from "@/lib/api/v1/input";
import { withAuthenticatedApi, MobileApiRequestError } from "@/lib/api/v1/response";
import type { MobileOnboardingResponse } from "@/lib/api/v1/contracts";
import {
  createCurrentUserFirstHousehold,
  getCurrentHouseholdOnboardingState,
} from "@/lib/server/household-onboarding";
import { acceptCurrentUserHouseholdInvitation } from "@/lib/server/household-invitations";

export const dynamic = "force-dynamic";

export function GET() {
  return withAuthenticatedApi(getOnboardingResponse);
}

export function POST(request: Request) {
  return withAuthenticatedApi(async () => {
    const input = await readJsonObject(request);
    const operation = requireEnum(input, "operation", [
      "create_household",
      "accept_invitation",
    ] as const);

    try {
      if (operation === "accept_invitation") {
        await acceptCurrentUserHouseholdInvitation();
      } else {
        const householdName = requireText(input, "householdName", 2, 80);
        await createCurrentUserFirstHousehold(householdName);
      }
    } catch {
      throw new MobileApiRequestError("Household setup could not be completed.");
    }

    return getOnboardingResponse();
  });
}

async function getOnboardingResponse(): Promise<MobileOnboardingResponse> {
  const state = await getCurrentHouseholdOnboardingState();
  return {
    apiVersion: "1",
    generatedAt: new Date().toISOString(),
    ...state,
  };
}
