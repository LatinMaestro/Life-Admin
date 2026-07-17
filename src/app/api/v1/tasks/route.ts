import { optionalText, readJsonObject, requireText } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileTasks } from "@/lib/server/mobile-module-reads";
import { createMobileTask } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileTasks);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const title = requireText(input, "title", 2, 120);
    const notes = optionalText(input, "notes", 1_000);
    return createMobileTask(context, title, notes);
  });
}
