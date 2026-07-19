import "server-only";

import type { DocumentExtractor } from "@/lib/extraction/contracts";
import { CloudflareDocumentExtractor } from "@/lib/extraction/cloudflare";

export async function getDocumentExtractor(): Promise<DocumentExtractor> {
  return new CloudflareDocumentExtractor();
}
