import { withHouseholdApi } from "@/lib/api/v1/response";
import { listIntakeDrafts } from "@/lib/server/intake-drafts";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(listIntakeDrafts);
}
