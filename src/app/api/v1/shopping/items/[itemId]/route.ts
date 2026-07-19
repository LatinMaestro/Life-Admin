import {
  optionalText,
  requireBoolean,
  requireId,
  requireText,
  readJsonObject,
} from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import {
  deleteMobileShoppingItem,
  updateMobileShoppingItem,
} from "@/lib/server/mobile-item-management";
import { setMobileShoppingItemChecked } from "@/lib/server/mobile-module-writes";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ itemId: string }> };

export function PATCH(request: Request, { params }: RouteParams) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const itemId = requireId((await params).itemId);

    if (typeof input.checked === "boolean") {
      return setMobileShoppingItemChecked(
        context,
        itemId,
        requireBoolean(input, "checked"),
      );
    }

    await updateMobileShoppingItem(context, itemId, {
      label: requireText(input, "label", 1, 120),
      notes: optionalText(input, "notes", 500),
      quantity: optionalText(input, "quantity", 80),
      category: optionalText(input, "category", 80),
    });
    return { apiVersion: "1" as const, generatedAt: new Date().toISOString(), success: true as const };
  });
}

export function DELETE(_request: Request, { params }: RouteParams) {
  return withHouseholdApi(async (context) => {
    const itemId = requireId((await params).itemId);
    await deleteMobileShoppingItem(context, itemId);
    return { apiVersion: "1" as const, generatedAt: new Date().toISOString(), success: true as const };
  });
}
