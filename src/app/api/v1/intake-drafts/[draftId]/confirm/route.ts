import { readJsonObject, requireId } from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import {
  confirmIntakeDraft,
  type ConfirmIntakeDraftInput,
} from "@/lib/server/intake-drafts";

export const dynamic = "force-dynamic";

const draftTypes = new Set(["inbox", "task", "reminder", "bill", "renewal", "source_reference"]);

export function POST(
  request: Request,
  { params }: { params: Promise<{ draftId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const body = await readJsonObject(request);
    const input: ConfirmIntakeDraftInput = {};
    if (typeof body.proposedType === "string") {
      if (!draftTypes.has(body.proposedType)) throw new MobileApiRequestError("Choose a valid item type.");
      input.proposedType = body.proposedType as ConfirmIntakeDraftInput["proposedType"];
    }
    if (typeof body.title === "string") input.title = body.title;
    if (body.provider === null || typeof body.provider === "string") input.provider = body.provider;
    if (body.safeNotes === null || typeof body.safeNotes === "string") input.safeNotes = body.safeNotes;
    if (body.assignedMemberId === null || typeof body.assignedMemberId === "string") {
      input.assignedMemberId = body.assignedMemberId;
    }
    input.dueAt = optionalDate(body.dueAt);
    input.renewalAt = optionalDate(body.renewalAt);
    return confirmIntakeDraft(context, requireId((await params).draftId), input);
  });
}

function optionalDate(value: unknown) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") throw new MobileApiRequestError("Choose a valid date.");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new MobileApiRequestError("Choose a valid date.");
  return date;
}
