import {
  optionalId,
  optionalText,
  readJsonObject,
  requireDate,
  requireText,
} from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileTasks } from "@/lib/server/mobile-module-reads";
import {
  createMobileReminder,
  createMobileTask,
} from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileTasks);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const title = requireText(input, "title", 2, 120);
    const notes = optionalText(input, "notes", 1_000);
    const assignedMemberId = optionalId(input, "assignedMemberId");
    const kind = input.kind ?? "task";

    if (kind === "task") {
      const dueAt = requireDate(input, "dueAt");
      return createMobileTask(context, title, notes, dueAt, assignedMemberId);
    }
    if (kind === "reminder") {
      const remindAt = requireDate(input, "remindAt");
      return createMobileReminder(context, title, notes, remindAt, assignedMemberId);
    }
    throw new MobileApiRequestError("Choose task or reminder.");
  });
}
