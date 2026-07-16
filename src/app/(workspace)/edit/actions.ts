"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isEditableItemType,
  ItemEditingError,
  updateEditableItem,
} from "@/lib/server/item-editing";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

export async function updateHouseholdItemAction(formData: FormData) {
  const type = readText(formData, "entityType");
  const id = readText(formData, "itemId");
  const title = readText(formData, "title");
  const notes = readText(formData, "notes");
  const provider = readText(formData, "provider");
  const assignedMemberId = readText(formData, "assignedMemberId");
  const date = readOptionalDate(formData, "date");

  if (
    !isEditableItemType(type) ||
    !id ||
    title.length < 2 ||
    title.length > 120 ||
    notes.length > 1_000 ||
    provider.length > 120 ||
    date === "invalid"
  ) {
    redirect(getEditPath(type, id, "invalid"));
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    await updateEditableItem(context, type, id, {
      title,
      notes: notes || null,
      provider: provider || null,
      date,
      assignedMemberId: assignedMemberId || null,
    });
  } catch (error) {
    if (error instanceof ItemEditingError) {
      redirect(getEditPath(type, id, "invalid"));
    }
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/tasks");
  revalidatePath("/bills");
  revalidatePath("/activity");
  redirect(getReturnPath(type) + "?updated=true");
}

function getEditPath(type: string, id: string, error: string) {
  const safeType = isEditableItemType(type) ? type : "task";
  const safeId = encodeURIComponent(id || "missing");
  return `/edit/${safeType}/${safeId}?error=${error}`;
}

function getReturnPath(type: string) {
  if (type === "inbox_item") return "/inbox";
  if (type === "bill_or_renewal") return "/bills";
  return "/tasks";
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
