"use server";

import { revalidatePath } from "next/cache";
import { HouseholdAccessError } from "@/lib/access-control";
import type {
  CreateReminderInput,
  CreateTaskInput,
} from "@/lib/persistence/contracts";
import { getHouseholdPersistenceAdapter } from "@/lib/server/persistence";
import { getRuntimeHouseholdAccessContext } from "@/lib/server/runtime-access-context";

export type WorkCaptureState = {
  status: "idle" | "success" | "error";
  message: string;
};

const priorities = new Set<CreateTaskInput["priority"]>(["low", "normal", "high"]);
const cadences = new Set<CreateReminderInput["cadence"]>([
  "once",
  "weekly",
  "monthly",
  "custom",
]);

export async function createTaskAction(
  _previousState: WorkCaptureState,
  formData: FormData,
): Promise<WorkCaptureState> {
  const title = readText(formData, "title");
  const notes = readText(formData, "notes");
  const priority = readText(formData, "priority");
  const dueAt = readOptionalDate(formData, "dueAt");
  const assignedMemberId = readText(formData, "assignedMemberId");

  const commonError = validateCommon(title, notes);
  if (commonError) {
    return commonError;
  }

  if (!priorities.has(priority as CreateTaskInput["priority"])) {
    return errorState("Choose a valid priority.");
  }

  if (dueAt === "invalid") {
    return errorState("Choose a valid due date.");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    const adapter = await getHouseholdPersistenceAdapter();

    await adapter.createTask(context, {
      title,
      notes: notes || null,
      priority: priority as CreateTaskInput["priority"],
      dueAt,
      assignedMemberId: assignedMemberId || null,
    });

    revalidateWorkPages();
    return { status: "success", message: "Task saved to your household." };
  } catch (error) {
    return handleWriteError(error, "task");
  }
}

export async function createReminderAction(
  _previousState: WorkCaptureState,
  formData: FormData,
): Promise<WorkCaptureState> {
  const title = readText(formData, "title");
  const notes = readText(formData, "notes");
  const cadence = readText(formData, "cadence");
  const remindAt = readOptionalDate(formData, "remindAt");
  const assignedMemberId = readText(formData, "assignedMemberId");

  const commonError = validateCommon(title, notes);
  if (commonError) {
    return commonError;
  }

  if (!cadences.has(cadence as CreateReminderInput["cadence"])) {
    return errorState("Choose a valid cadence.");
  }

  if (!remindAt || remindAt === "invalid") {
    return errorState("Choose a valid reminder date.");
  }

  try {
    const context = await getRuntimeHouseholdAccessContext();
    const adapter = await getHouseholdPersistenceAdapter();

    await adapter.createReminder(context, {
      title,
      notes: notes || null,
      cadence: cadence as CreateReminderInput["cadence"],
      remindAt,
      assignedMemberId: assignedMemberId || null,
    });

    revalidateWorkPages();
    return { status: "success", message: "Reminder saved to your household." };
  } catch (error) {
    return handleWriteError(error, "reminder");
  }
}

export async function toggleWorkCompletedAction(formData: FormData) {
  const itemId = readText(formData, "itemId");
  const entityType = readText(formData, "entityType");
  const completed = readText(formData, "completed") === "true";

  if (!itemId || (entityType !== "task" && entityType !== "reminder")) return;

  const context = await getRuntimeHouseholdAccessContext();
  const adapter = await getHouseholdPersistenceAdapter();

  if (entityType === "task") {
    await adapter.setTaskCompleted(context, itemId, completed);
  } else {
    await adapter.setReminderCompleted(context, itemId, completed);
  }

  revalidateWorkPages();
}

function validateCommon(title: string, notes: string): WorkCaptureState | null {
  if (title.length < 2 || title.length > 120) {
    return errorState("Enter a title between 2 and 120 characters.");
  }

  if (notes.length > 1_000) {
    return errorState("Keep notes under 1,000 characters.");
  }

  return null;
}

function readText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalDate(formData: FormData, field: string): Date | null | "invalid" {
  const value = readText(formData, field);
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "invalid";
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? "invalid" : parsed;
}

function revalidateWorkPages() {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/activity");
}

function errorState(message: string): WorkCaptureState {
  return { status: "error", message };
}

function handleWriteError(error: unknown, itemLabel: string): WorkCaptureState {
  if (error instanceof HouseholdAccessError) {
    return errorState(error.message);
  }

  console.error(`Unable to create household ${itemLabel}.`, error);
  return errorState(`The ${itemLabel} could not be saved. Please try again.`);
}
