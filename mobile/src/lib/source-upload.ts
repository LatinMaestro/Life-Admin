import { useAuth } from "@clerk/expo";
import { useCallback } from "react";

type UploadIntent = {
  assetId: string;
  uploadUrl: string;
  mediaType: string;
};

type UploadInput = {
  title: string;
  uri: string;
  originalName: string;
  mediaType: string;
  purpose: "camera_original" | "camera_crop" | "voice_audio";
  onStage?: (stage: "preparing" | "uploading" | "checking") => void;
};

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

export function usePrivateSourceUpload() {
  const { getToken } = useAuth();

  return useCallback(async (input: UploadInput) => {
    if (!apiUrl) throw new Error("The app service has not been configured.");
    const token = await getToken();
    if (!token) throw new Error("Your session could not be verified.");

    input.onStage?.("preparing");
    const localResponse = await fetch(input.uri);
    const file = await localResponse.blob();
    if (file.size < 1) throw new Error("The selected image could not be read.");

    const intentResponse = await fetch(`${apiUrl}/api/v1/source-assets`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: input.title,
        originalName: input.originalName,
        mediaType: input.mediaType,
        byteSize: file.size,
        purpose: input.purpose,
      }),
    });
    const intent = await readResponse<UploadIntent>(intentResponse);

    input.onStage?.("uploading");
    const transfer = await fetch(intent.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": intent.mediaType },
      body: file,
    });
    if (!transfer.ok) throw new Error("The private image upload could not be transferred.");

    input.onStage?.("checking");
    await readResponse(
      await fetch(`${apiUrl}/api/v1/source-assets/${intent.assetId}/finalize`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
    );
    const processingPath = input.purpose === "voice_audio" ? "transcribe" : "process";
    const processing = await fetch(
      `${apiUrl}/api/v1/source-assets/${intent.assetId}/${processingPath}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { reviewReady: processing.ok };
  }, [getToken]);
}

async function readResponse<T = unknown>(response: Response) {
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "The private source request failed.");
  }
  return body;
}
