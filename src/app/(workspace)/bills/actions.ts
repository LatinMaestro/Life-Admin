"use server";

import { revalidatePath } from "next/cache";
import { HouseholdAccessError } from "@/lib/access-control";
import type { CreateBillOrRenewalInput } from "@/lib/persistence/contracts";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

export type BillCaptureState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createBillOrRenewalAction(
  _previousState: BillCaptureState,
  formData: FormData,
): Promise<BillCaptureState> {
  const title = readText(formData, "title");
  const provider = readText(formData, "provider");
  const type = readText(formData, "type");
  const date = readDate(formData, "date");
  const sourceReferenceId = readText(formData, "sourceReferenceId");
  const assignedMemberId = readText(formData, "assignedMemberId");

  if (title.length < 2 || title.length > 120) {
    return errorState("Enter a title between 2 and 120 characters.");
  }

  if (provider.length > 120) {
    return errorState("Keep the provider name under 120 characters.");
  }

  if (type !== "bill" && type !== "renewal") {
    return errorState("Choose bill or renewal.");
  }

  if (!date) {
    return errorState("Choose a valid date.");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    const adapter = await getHouseholdPersistenceAdapter();
    const input: CreateBillOrRenewalInput = {
      title,
      provider: provider || null,
      type,
      dueAt: type === "bill" ? date : null,
      renewalAt: type === "renewal" ? date : null,
      sourceReferenceId: sourceReferenceId || null,
      assignedMemberId: assignedMemberId || null,
    };

    await adapter.createBillOrRenewal(context, input);
    revalidatePath("/");
    revalidatePath("/bills");
    revalidatePath("/activity");
    return { status: "success", message: "Reminder saved." };
  } catch (error) {
    if (error instanceof HouseholdAccessError) {
      return errorState(error.message);
    }

    console.error("Unable to create bill or renewal reminder.", error);
    return errorState("The reminder could not be saved. Please try again.");
  }
}

export async function toggleBillOrRenewalCompletedAction(formData: FormData) {
  const itemId = readText(formData, "itemId");
  const completed = readText(formData, "completed") === "true";
  if (!itemId) return;

  const context = await getRuntimeHouseholdAccessContext();
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.setBillOrRenewalCompleted(context, itemId, completed);
  revalidatePath("/");
  revalidatePath("/bills");
  revalidatePath("/activity");
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function readDate(formData: FormData, field: string) {
  const value = readText(formData, field);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function errorState(message: string): BillCaptureState {
  return { status: "error", message };
}
