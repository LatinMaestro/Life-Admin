"use client";

import { FileUp, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UploadIntent = {
  assetId: string;
  uploadUrl: string;
  mediaType: string;
};

const acceptedTypes = ".pdf,.jpg,.jpeg,.png,.heic,.heif";

export function SourceFileUpload() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload() {
    if (!file || title.trim().length < 2) return;
    setBusy(true);
    setMessage("Preparing private upload...");
    try {
      const intentResponse = await fetch("/api/v1/source-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          originalName: file.name,
          mediaType: file.type || mediaTypeFromName(file.name),
          byteSize: file.size,
          purpose: "direct_upload",
        }),
      });
      const intent = await readJson<UploadIntent>(intentResponse);

      setMessage("Uploading...");
      const transfer = await fetch(intent.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": intent.mediaType },
        body: file,
      });
      if (!transfer.ok) throw new Error("The private upload could not be transferred.");

      setMessage("Checking file...");
      await readJson(
        await fetch(`/api/v1/source-assets/${intent.assetId}/finalize`, {
          method: "POST",
        }),
      );

      setMessage("Reading document...");
      const processing = await fetch(`/api/v1/source-assets/${intent.assetId}/process`, {
        method: "POST",
      });

      setTitle("");
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      setMessage(
        processing.ok
          ? "Ready to review in your inbox."
          : "Private source added. Automatic reading needs attention.",
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The source could not be added.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details id="source-file-upload" className="mt-6 scroll-mt-24 rounded-md border bg-card">
      <summary className="cursor-pointer px-4 py-3 font-medium">
        <span className="inline-flex items-center gap-2">
          <FileUp className="h-4 w-4" aria-hidden="true" />
          Upload private file
        </span>
      </summary>
      <div className="grid gap-4 border-t p-4">
        <label className="space-y-2 text-sm font-medium" htmlFor="source-file-title">
          Name
          <Input
            id="source-file-title"
            maxLength={120}
            minLength={2}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Electricity notice"
            value={title}
          />
        </label>
        <label className="space-y-2 text-sm font-medium" htmlFor="source-file">
          PDF or image
          <Input
            ref={fileInput}
            accept={acceptedTypes}
            id="source-file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>Private to your household. Maximum 15 MB. Open the original when payment details are needed.</p>
        </div>
        <div>
          <Button disabled={busy || !file || title.trim().length < 2} onClick={() => void upload()} type="button">
            <FileUp className="h-4 w-4" aria-hidden="true" />
            {busy ? "Working..." : "Upload"}
          </Button>
          <p aria-live="polite" className="mt-3 text-sm text-muted-foreground" role="status">
            {message}
          </p>
        </div>
      </div>
    </details>
  );
}

async function readJson<T = unknown>(response: Response) {
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "The private source request failed.");
  }
  return body;
}

function mediaTypeFromName(name: string) {
  const extension = name.toLowerCase().split(".").pop();
  if (extension === "pdf") return "application/pdf";
  if (extension === "png") return "image/png";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";
  return "image/jpeg";
}
