import "server-only";

import { CloudflareSpeechTranscriber } from "@/lib/speech/cloudflare";
import type { SpeechTranscriber } from "@/lib/speech/contracts";

export async function getSpeechTranscriber(): Promise<SpeechTranscriber> {
  return new CloudflareSpeechTranscriber();
}
