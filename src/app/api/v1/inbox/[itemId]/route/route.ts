import {
  optionalHttpsUrl,
  optionalText,
  readJsonObject,
  requireDate,
  requireEnum,
  requireId,
  requireText,
} from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import {
  routeMobileInboxItem,
  type InboxRoutingInput,
} from "@/lib/server/mobile-inbox-routing";

export const dynamic = "force-dynamic";

const destinations = [
  "task",
  "reminder",
  "bill_or_renewal",
  "shopping_list",
  "source_reference",
] as const;

export function POST(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  return withHouseholdApi(async (context) => {
    const values = await readJsonObject(request);
    const itemId = requireId((await params).itemId);
    const destination = requireEnum(values, "destination", destinations);
    let input: InboxRoutingInput;

    switch (destination) {
      case "task":
      case "reminder":
        input = {
          destination,
          date: requireDate(values, "date"),
        };
        break;
      case "bill_or_renewal":
        input = {
          destination,
          date: requireDate(values, "date"),
          reminderType: requireEnum(values, "reminderType", [
            "bill",
            "renewal",
          ] as const),
          provider: optionalText(values, "provider", 120),
        };
        break;
      case "shopping_list":
        input = {
          destination,
          shoppingListId: requireId(
            typeof values.shoppingListId === "string"
              ? values.shoppingListId
              : undefined,
          ),
        };
        break;
      case "source_reference":
        input = {
          destination,
          label: requireText(values, "label", 1, 160),
          url: optionalHttpsUrl(values, "url"),
        };
        break;
    }

    await routeMobileInboxItem(context, itemId, input);
    return {
      apiVersion: "1" as const,
      generatedAt: new Date().toISOString(),
      success: true as const,
    };
  });
}
