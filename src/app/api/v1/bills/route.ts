import {
  optionalId,
  optionalText,
  readJsonObject,
  requireDate,
  requireEnum,
  requireText,
} from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileBills } from "@/lib/server/mobile-module-reads";
import { createMobileBillOrRenewal } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileBills);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const title = requireText(input, "title", 2, 120);
    const provider = optionalText(input, "provider", 120);
    const type = requireEnum(input, "type", ["bill", "renewal"] as const);
    const date = requireDate(input, "date");
    const sourceReferenceId = optionalId(input, "sourceReferenceId");
    const assignedMemberId = optionalId(input, "assignedMemberId");
    return createMobileBillOrRenewal(context, {
      title,
      provider,
      type,
      date,
      sourceReferenceId,
      assignedMemberId,
    });
  });
}
