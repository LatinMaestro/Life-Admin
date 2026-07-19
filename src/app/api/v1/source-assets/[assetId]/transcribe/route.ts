import { requireId } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { processVoiceAsset } from "@/lib/server/intake-drafts";

export const dynamic = "force-dynamic";

export function POST(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  return withHouseholdApi(async (context) =>
    processVoiceAsset(context, requireId((await params).assetId)),
  );
}
