import { readJsonObject, requireEnum, requireText } from "@/lib/api/v1/input";
import { MobileApiRequestError, withHouseholdApi } from "@/lib/api/v1/response";
import {
  createSourceAssetUpload,
  isAllowedSourceMediaType,
  listSourceAssets,
} from "@/lib/server/source-assets";

export const dynamic = "force-dynamic";

export function GET() {
  return withHouseholdApi(listSourceAssets);
}

export function POST(request: Request) {
  return withHouseholdApi(async (context) => {
    const input = await readJsonObject(request);
    const title = requireText(input, "title", 2, 120);
    const originalName = requireText(input, "originalName", 1, 180);
    const mediaType = requireText(input, "mediaType", 3, 100);
    if (!isAllowedSourceMediaType(mediaType)) {
      throw new MobileApiRequestError("Choose a PDF, JPEG, PNG, or HEIC file.");
    }
    const byteSize = input.byteSize;
    if (typeof byteSize !== "number") {
      throw new MobileApiRequestError("The selected file size is required.");
    }
    const purpose = requireEnum(
      input,
      "purpose",
      ["direct_upload", "camera_original", "camera_crop"] as const,
    );
    return createSourceAssetUpload(context, {
      title,
      originalName,
      mediaType,
      byteSize,
      purpose,
    });
  });
}
