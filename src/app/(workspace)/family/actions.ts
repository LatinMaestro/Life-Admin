"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { HouseholdRole } from "@/lib/access-control";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";
import {
  acceptCurrentUserHouseholdInvitation,
  createHouseholdInvitation,
  HouseholdInvitationError,
} from "@/lib/server/household-invitations";

const roles = new Set<HouseholdRole>(["household_admin", "household_member"]);

export async function createHouseholdInvitationAction(formData: FormData) {
  const emailValue = formData.get("email");
  const roleValue = formData.get("role");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  const role = typeof roleValue === "string" ? roleValue : "";

  if (!/^\S+@\S+\.\S+$/.test(email) || !roles.has(role as HouseholdRole)) {
    redirect("/family?invite=invalid");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    await createHouseholdInvitation(context, email, role as HouseholdRole);
  } catch (error) {
    const reason =
      error instanceof HouseholdInvitationError &&
      error.message === "That person is already in this household."
        ? "member"
        : "error";
    redirect(`/family?invite=${reason}`);
  }

  revalidatePath("/family");
  revalidatePath("/activity");
  redirect("/family?invite=sent");
}

export async function acceptHouseholdInvitationAction() {
  try {
    await acceptCurrentUserHouseholdInvitation();
  } catch {
    redirect("/access-pending?join=error");
  }

  redirect("/");
}
