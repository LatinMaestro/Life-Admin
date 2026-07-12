"use server";

import { revalidatePath } from "next/cache";
import { HouseholdAccessError } from "@/lib/access-control";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

export type ShoppingCaptureState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function createShoppingListAction(
  _previousState: ShoppingCaptureState,
  formData: FormData,
): Promise<ShoppingCaptureState> {
  const name = readText(formData, "name");

  if (name.length < 2 || name.length > 80) {
    return errorState("Enter a list name between 2 and 80 characters.");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    const adapter = await getHouseholdPersistenceAdapter();
    await adapter.createShoppingList(context, { name });
    revalidateShoppingPages();
    return { status: "success", message: "Shopping list created." };
  } catch (error) {
    return handleWriteError(error, "list");
  }
}

export async function createShoppingItemAction(
  _previousState: ShoppingCaptureState,
  formData: FormData,
): Promise<ShoppingCaptureState> {
  const shoppingListId = readText(formData, "shoppingListId");
  const label = readText(formData, "label");
  const quantity = readText(formData, "quantity");
  const category = readText(formData, "category");
  const notes = readText(formData, "notes");

  if (!shoppingListId) {
    return errorState("Choose a shopping list.");
  }

  if (label.length < 1 || label.length > 120) {
    return errorState("Enter an item name up to 120 characters.");
  }

  if (quantity.length > 40 || category.length > 60 || notes.length > 500) {
    return errorState("Keep quantity, category, and notes concise.");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    const adapter = await getHouseholdPersistenceAdapter();
    await adapter.createShoppingListItem(context, {
      shoppingListId,
      label,
      quantity: quantity || null,
      category: category || null,
      notes: notes || null,
    });
    revalidateShoppingPages();
    return { status: "success", message: "Item added to the household list." };
  } catch (error) {
    return handleWriteError(error, "item");
  }
}

export async function toggleShoppingItemAction(formData: FormData) {
  const itemId = readText(formData, "itemId");
  const checked = readText(formData, "checked") === "true";

  if (!itemId) {
    return;
  }

  const context = await getRuntimeHouseholdAccessContext();
  const adapter = await getHouseholdPersistenceAdapter();
  await adapter.setShoppingListItemChecked(context, itemId, checked);
  revalidateShoppingPages();
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateShoppingPages() {
  revalidatePath("/");
  revalidatePath("/lists");
  revalidatePath("/activity");
}

function errorState(message: string): ShoppingCaptureState {
  return { status: "error", message };
}

function handleWriteError(error: unknown, label: string): ShoppingCaptureState {
  if (error instanceof HouseholdAccessError) {
    return errorState(error.message);
  }

  console.error(`Unable to save household shopping ${label}.`, error);
  return errorState(`The shopping ${label} could not be saved. Please try again.`);
}
