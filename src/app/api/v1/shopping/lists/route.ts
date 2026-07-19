import { readJsonObject, requireText } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { createMobileShoppingList } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const name = requireText(input, "name", 2, 80);
    return createMobileShoppingList(context, name);
  });
}
