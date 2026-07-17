import { optionalText, readJsonObject, requireText } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileInbox } from "@/lib/server/mobile-module-reads";
import { createMobileInboxItem } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileInbox);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const title = requireText(input, "title", 2, 120);
    const description = optionalText(input, "description", 1_000);
    return createMobileInboxItem(context, title, description);
  });
}
