import { requireId } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import { finalizeSourceAsset } from "@/lib/server/source-assets";

export const dynamic = "force-dynamic";

export function POST(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  return withHouseholdApi(async (context) =>
    finalizeSourceAsset(context, requireId((await params).assetId)),
  );
}
