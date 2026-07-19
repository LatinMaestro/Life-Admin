import { requireId } from "@/lib/api/v1/input";
import { withHouseholdApi } from "@/lib/api/v1/response";
import {
  createSourceAssetReadUrl,
  deleteSourceAsset,
} from "@/lib/server/source-assets";

export const dynamic = "force-dynamic";

export function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  return withHouseholdApi(async (context) =>
    createSourceAssetReadUrl(context, requireId((await params).assetId)),
  );
}

export function DELETE(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  return withHouseholdApi(async (context) =>
    deleteSourceAsset(context, requireId((await params).assetId)),
  );
}
