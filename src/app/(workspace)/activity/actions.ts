"use server";

import { revalidatePath } from "next/cache";
import { HouseholdAccessError } from "@/lib/access-control";
import type { CreateCommentInput } from "@/lib/persistence/contracts";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

export type CommentState = {
  status: "idle" | "success" | "error";
  message: string;
};

const targetTypes = new Set<CreateCommentInput["entityType"]>([
  "inbox_item",
  "task",
  "reminder",
  "shopping_list",
  "bill_or_renewal",
  "source_reference",
]);

export async function createCommentAction(
  _previousState: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const target = readText(formData, "target");
  const body = readText(formData, "body");
  const separator = target.indexOf(":");
  const entityType = target.slice(0, separator) as CreateCommentInput["entityType"];
  const entityId = target.slice(separator + 1);

  if (separator < 1 || !targetTypes.has(entityType) || !entityId) {
    return errorState("Choose an item.");
  }

  if (body.length < 1 || body.length > 500) {
    return errorState("Enter a comment up to 500 characters.");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    const adapter = await getHouseholdPersistenceAdapter();
    await adapter.createComment(context, { entityType, entityId, body });
    revalidatePath("/");
    revalidatePath("/activity");
    return { status: "success", message: "Comment added." };
  } catch (error) {
    if (error instanceof HouseholdAccessError) return errorState(error.message);
    console.error("Unable to create household comment.", error);
    return errorState("The comment could not be saved. Please try again.");
  }
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function errorState(message: string): CommentState {
  return { status: "error", message };
}
