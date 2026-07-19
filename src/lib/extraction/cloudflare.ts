import "server-only";

import type {
  DocumentExtractionInput,
  DocumentExtractionResult,
  DocumentExtractor,
} from "@/lib/extraction/contracts";

type ConversionResponse = {
  success?: boolean;
  result?: Array<{
    format?: string;
    data?: string;
    error?: string;
  }>;
};

export class CloudflareDocumentExtractor implements DocumentExtractor {
  async extract(input: DocumentExtractionInput): Promise<DocumentExtractionResult> {
    const { accountId, apiToken } = config();
    const form = new FormData();
    form.append(
      "files",
      new Blob([Buffer.from(input.bytes)], { type: input.mediaType }),
      safeFileName(input.fileName),
    );
    form.append("conversionOptions", JSON.stringify({
      output: { format: "text" },
      pdf: { metadata: false },
      image: { descriptionLanguage: "en" },
    }));

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/tomarkdown`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${apiToken}` },
        body: form,
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("Document extraction is temporarily unavailable.");

    const payload = await response.json() as ConversionResponse;
    const converted = payload.success ? payload.result?.[0] : null;
    if (!converted || converted.format === "error" || typeof converted.data !== "string") {
      throw new Error("This document could not be read automatically.");
    }
    return {
      text: converted.data.slice(0, 100_000),
      strategy: input.mediaType.startsWith("image/") ? "document_ocr" : "embedded_text",
      pageCount: null,
      confidence: null,
    };
  }
}

function config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN;
  if (!accountId || !apiToken) throw new Error("Document extraction is not configured.");
  return { accountId, apiToken };
}

function safeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "source";
}
