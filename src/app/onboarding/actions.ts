"use server";

import { redirect } from "next/navigation";
import {
  createCurrentUserFirstHousehold,
  HouseholdOnboardingError,
} from "@/lib/server/household-onboarding";
import {
  acceptCurrentUserHouseholdInvitation,
  HouseholdInvitationError,
} from "@/lib/server/household-invitations";

export async function createFirstHouseholdAction(formData: FormData) {
  const nameValue = formData.get("householdName");
  const householdName = typeof nameValue === "string" ? nameValue.trim() : "";

  try {
    await createCurrentUserFirstHousehold(householdName);
  } catch (error) {
    const reason =
      error instanceof HouseholdOnboardingError &&
      error.message.startsWith("Household name")
        ? "name"
        : "error";
    redirect(`/onboarding?create=${reason}`);
  }

  redirect("/");
}

export async function acceptOnboardingInvitationAction() {
  try {
    await acceptCurrentUserHouseholdInvitation();
  } catch (error) {
    const reason =
      error instanceof HouseholdInvitationError ? "invitation" : "error";
    redirect(`/onboarding?join=${reason}`);
  }

  redirect("/");
}
