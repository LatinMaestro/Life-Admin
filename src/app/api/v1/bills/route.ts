import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileBills } from "@/lib/server/mobile-module-reads";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileBills);
}
