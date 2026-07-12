"use server";

import { revalidatePath } from "next/cache";
import { HouseholdAccessError } from "@/lib/access-control";
import type { CreateSourceReferenceInput } from "@/lib/persistence/contracts";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

export type SourceCaptureState = {
  status: "idle" | "success" | "error";
  message: string;
};

const kinds = new Set<CreateSourceReferenceInput["kind"]>([
  "source_link",
  "source_document_reference",
  "source_image_reference",
  "source_email_reference",
]);

export async function createSourceReferenceAction(
  _previousState: SourceCaptureState,
  formData: FormData,
): Promise<SourceCaptureState> {
  const title = readText(formData, "title");
  const kind = readText(formData, "kind");
  const label = readText(formData, "label");
  const url = readText(formData, "url");

  if (title.length < 2 || title.length > 120) {
    return errorState("Enter a title between 2 and 120 characters.");
  }

  if (!kinds.has(kind as CreateSourceReferenceInput["kind"])) {
    return errorState("Choose a valid source type.");
  }

  if (label.length < 2 || label.length > 200) {
    return errorState("Briefly say where the original can be found.");
  }

  if (url && !isSafeWebUrl(url)) {
    return errorState("Use a valid https link.");
  }

  if (kind === "source_link" && !url) {
    return errorState("Add the original https link.");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    const adapter = await getHouseholdPersistenceAdapter();
    await adapter.createSourceReference(context, {
      title,
      kind: kind as CreateSourceReferenceInput["kind"],
      label,
      url: url || null,
    });
    revalidatePath("/");
    revalidatePath("/sources");
    revalidatePath("/bills");
    revalidatePath("/activity");
    return { status: "success", message: "Source reference saved." };
  } catch (error) {
    if (error instanceof HouseholdAccessError) return errorState(error.message);
    console.error("Unable to create source reference.", error);
    return errorState("The source reference could not be saved. Please try again.");
  }
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function isSafeWebUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function errorState(message: string): SourceCaptureState {
  return { status: "error", message };
}
