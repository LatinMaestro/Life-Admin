"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  HouseholdSettingsError,
  isHouseholdTimezone,
  updateHouseholdProfile,
} from "@/lib/server/household-settings";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

export async function updateHouseholdProfileAction(formData: FormData) {
  const name = readText(formData, "name");
  const timezone = readText(formData, "timezone");

  if (name.length < 2 || name.length > 80 || !isHouseholdTimezone(timezone)) {
    redirect("/settings?profile=error#household-profile");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    await updateHouseholdProfile(context, name, timezone);
  } catch (error) {
    if (error instanceof HouseholdSettingsError) {
      redirect("/settings?profile=error#household-profile");
    }
    throw error;
  }

  revalidatePath("/", "layout");
  revalidatePath("/settings");
  revalidatePath("/activity");
  redirect("/settings?profile=saved");
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
