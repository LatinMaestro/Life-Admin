import { optionalText, readJsonObject, requireId, requireText } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { getMobileShopping } from "@/lib/server/mobile-module-reads";
import { createMobileShoppingItem } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(getMobileShopping);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const shoppingListId = requireId(
      typeof input.shoppingListId === "string" ? input.shoppingListId : undefined,
    );
    const label = requireText(input, "label", 1, 120);
    const notes = optionalText(input, "notes", 500);
    return createMobileShoppingItem(context, shoppingListId, label, notes);
  });
}
