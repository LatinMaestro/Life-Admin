"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { HouseholdRole } from "@/lib/access-control";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";
import {
  acceptCurrentUserHouseholdInvitation,
  createHouseholdInvitation,
  HouseholdInvitationError,
  deactivateHouseholdMember,
  revokeHouseholdInvitation,
  updateHouseholdMemberRole,
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


export async function revokeHouseholdInvitationAction(formData: FormData) {
  const invitationId = readText(formData, "invitationId");
  if (!invitationId) redirect("/family?manage=error");

  try {
    const context = await getRuntimeHouseholdAccessContext();
    await revokeHouseholdInvitation(context, invitationId);
  } catch {
    redirect("/family?manage=error");
  }

  revalidatePath("/family");
  revalidatePath("/activity");
  redirect("/family?manage=revoked");
}

export async function manageHouseholdMemberAction(formData: FormData) {
  const memberId = readText(formData, "memberId");
  const operation = readText(formData, "operation");
  const role = readText(formData, "role");

  if (!memberId || (operation !== "role" && operation !== "remove")) {
    redirect("/family?manage=error");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    if (operation === "remove") {
      await deactivateHouseholdMember(context, memberId);
    } else {
      if (!roles.has(role as HouseholdRole)) redirect("/family?manage=error");
      await updateHouseholdMemberRole(context, memberId, role as HouseholdRole);
    }
  } catch {
    redirect("/family?manage=error");
  }

  revalidatePath("/");
  revalidatePath("/family");
  revalidatePath("/activity");
  redirect(`/family?manage=${operation === "remove" ? "removed" : "updated"}`);
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
