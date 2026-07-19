"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  confirmIntakeDraft,
  dismissIntakeDraft,
  type ConfirmIntakeDraftInput,
} from "@/lib/server/intake-drafts";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

const types = new Set(["inbox", "task", "reminder", "bill", "renewal", "source_reference"]);

export async function confirmIntakeDraftAction(formData: FormData) {
  const draftId = text(formData, "draftId");
  const proposedType = text(formData, "proposedType");
  const eventDate = optionalDate(text(formData, "eventDate"));
  if (!draftId || !types.has(proposedType) || eventDate === "invalid") {
    redirect("/inbox?draft=error");
  }

  const input: ConfirmIntakeDraftInput = {
    proposedType: proposedType as ConfirmIntakeDraftInput["proposedType"],
    title: text(formData, "title"),
    provider: text(formData, "provider") || null,
    safeNotes: text(formData, "safeNotes") || null,
    assignedMemberId: text(formData, "assignedMemberId") || null,
    dueAt: proposedType === "renewal" ? null : eventDate,
    renewalAt: proposedType === "renewal" ? eventDate : null,
  };

  try {
    await confirmIntakeDraft(await getRuntimeHouseholdAccessContext(), draftId, input);
  } catch {
    redirect("/inbox?draft=error");
  }
  revalidateAll();
  redirect("/inbox?draft=confirmed");
}

export async function dismissIntakeDraftAction(formData: FormData) {
  const draftId = text(formData, "draftId");
  if (!draftId) return;
  try {
    await dismissIntakeDraft(await getRuntimeHouseholdAccessContext(), draftId);
  } catch {
    redirect("/inbox?draft=error");
  }
  revalidateAll();
  redirect("/inbox?draft=dismissed");
}

function revalidateAll() {
  for (const path of ["/", "/inbox", "/tasks", "/bills", "/sources", "/activity"]) {
    revalidatePath(path);
  }
}

function optionalDate(value: string): Date | null | "invalid" {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "invalid";
  const parsed = new Date(`${value}T09:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? "invalid" : parsed;
}

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
