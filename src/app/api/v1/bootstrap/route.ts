import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileBootstrap } from "@/lib/server/mobile-bootstrap";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileBootstrap);
}
