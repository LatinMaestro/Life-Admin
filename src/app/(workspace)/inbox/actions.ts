"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { HouseholdAccessError } from "@/lib/access-control";
import type { CreateInboxItemInput } from "@/lib/persistence/contracts";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";
import { InboxRoutingError, routeInboxItem, type InboxRouteDestination } from "@/lib/server/inbox-routing";

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

const routeDestinations = new Set<InboxRouteDestination>(["task", "reminder", "shopping_item", "bill", "renewal"]);

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

export async function routeInboxItemAction(formData: FormData) {
  const inboxItemId = readText(formData, "inboxItemId");
  const destination = readText(formData, "routeDestination");
  const date = readOptionalDate(formData, "routeDate");
  const shoppingListId = readText(formData, "shoppingListId");

  if (!inboxItemId || !routeDestinations.has(destination as InboxRouteDestination) || date === "invalid") {
    redirect("/inbox?route=invalid#sort-inbox");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    await routeInboxItem(context, {
      inboxItemId,
      destination: destination as InboxRouteDestination,
      date,
      shoppingListId: shoppingListId || null,
    });
  } catch (error) {
    if (error instanceof InboxRoutingError) {
      redirect("/inbox?route=invalid#sort-inbox");
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/tasks");
  revalidatePath("/lists");
  revalidatePath("/bills");
  revalidatePath("/activity");
  redirect("/inbox?route=done");
}

function readOptionalDate(formData: FormData, field: string): Date | null | "invalid" {
  const value = readText(formData, field);
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "invalid";
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? "invalid" : parsed;
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}
