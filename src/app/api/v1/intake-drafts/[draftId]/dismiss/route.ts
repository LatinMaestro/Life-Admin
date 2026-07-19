import { requireId } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { dismissIntakeDraft } from "@/lib/server/intake-drafts";

export const dynamic = "force-dynamic";

export function POST(
  _request: Request,
  { params }: { params: Promise<{ draftId: string }> },
) {
  return withHouseholdApi(async (context) =>
    dismissIntakeDraft(context, requireId((await params).draftId)),
  );
}
