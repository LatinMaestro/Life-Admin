import { readJsonObject, requireEnum } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import {
  createOrRotateHouseholdEmailAlias,
  getHouseholdEmailAlias,
} from "@/lib/server/email-intake-alias";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getHouseholdEmailAlias);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    requireEnum(input, "action", ["create_or_rotate"] as const);
    return createOrRotateHouseholdEmailAlias(context);
  });
}
