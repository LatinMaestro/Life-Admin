import {
  optionalHttpsUrl,
  readJsonObject,
  requireText,
} from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileSources } from "@/lib/server/mobile-module-reads";
import { createMobileSourceReference } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileSources);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const title = requireText(input, "title", 2, 120);
    const label = requireText(input, "label", 2, 160);
    const url = optionalHttpsUrl(input, "url");
    return createMobileSourceReference(context, { title, label, url });
  });
}
