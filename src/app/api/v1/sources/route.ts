import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileSources } from "@/lib/server/mobile-module-reads";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileSources);
}
