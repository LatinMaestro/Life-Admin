"use server";

import { revalidatePath } from "next/cache";
import { HouseholdAccessError } from "@/lib/access-control";
import type { CreateInboxItemInput } from "@/lib/persistence/contracts";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";

export type InboxCaptureState = {
  status: "idle" | "success" | "error";
  message: string;
};

const categories = new Set<CreateInboxItemInput["category"]>([
  "school",
  "appointment",
  "renewal",
  "household_admin",
  "shopping",
  "other",
]);

const priorities = new Set<CreateInboxItemInput["priority"]>(["low", "normal", "high"]);

const destinations = new Set<CreateInboxItemInput["suggestedDestination"]>([
  "task",
  "reminder",
  "bill_or_renewal",
  "shopping_list",
  "source_reference",
  "none",
]);

export async function createInboxItemAction(
  _previousState: InboxCaptureState,
  formData: FormData,
): Promise<InboxCaptureState> {
  const title = readText(formData, "title");
  const description = readText(formData, "description");
  const category = readText(formData, "category");
  const priority = readText(formData, "priority");
  const suggestedDestination = readText(formData, "destination");

  if (title.length < 2 || title.length > 120) {
    return { status: "error", message: "Enter a title between 2 and 120 characters." };
  }

  if (description.length > 1_000) {
    return { status: "error", message: "Keep notes under 1,000 characters." };
  }

  if (!categories.has(category as CreateInboxItemInput["category"])) {
    return { status: "error", message: "Choose a valid category." };
  }

  if (!priorities.has(priority as CreateInboxItemInput["priority"])) {
    return { status: "error", message: "Choose a valid priority." };
  }

  if (!destinations.has(suggestedDestination as CreateInboxItemInput["suggestedDestination"])) {
    return { status: "error", message: "Choose a valid destination." };
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    const adapter = await getHouseholdPersistenceAdapter();

    await adapter.createInboxItem(context, {
      title,
      description: description || null,
      category: category as CreateInboxItemInput["category"],
      priority: priority as CreateInboxItemInput["priority"],
      suggestedDestination:
        suggestedDestination as CreateInboxItemInput["suggestedDestination"],
    });

    revalidatePath("/");
    revalidatePath("/inbox");

    return { status: "success", message: "Inbox item saved to your household." };
  } catch (error) {
    if (error instanceof HouseholdAccessError) {
      return { status: "error", message: error.message };
    }

    console.error("Unable to create household inbox item.", error);
    return { status: "error", message: "The item could not be saved. Please try again." };
  }
}

export async function toggleInboxArchivedAction(formData: FormData) {
  const itemId = readText(formData, "itemId");
  const archived = readText(formData, "archived") === "true";
  if (!itemId) return;

  const context = await getRuntimeHouseholdAccessContext();
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.setInboxItemArchived(context, itemId, archived);
  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/activity");
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
