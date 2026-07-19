import "server-only";

import type {
  SpeechTranscriber,
  SpeechTranscriptionInput,
  SpeechTranscriptionResult,
} from "@/lib/speech/contracts";

type SpeechResponse = {
  success?: boolean;
  result?: {
    text?: string;
    transcription_info?: { text?: string };
  };
};

export class CloudflareSpeechTranscriber implements SpeechTranscriber {
  async transcribe(input: SpeechTranscriptionInput): Promise<SpeechTranscriptionResult> {
    const { accountId, apiToken } = config();
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/openai/whisper-large-v3-turbo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: Buffer.from(input.bytes).toString("base64"),
          language: "en",
          task: "transcribe",
          vad_filter: true,
          condition_on_previous_text: false,
        }),
        cache: "no-store",
      },
    );
    if (!response.ok) throw new Error("Voice processing is temporarily unavailable.");
    const payload = await response.json() as SpeechResponse;
    const text = payload.result?.text ?? payload.result?.transcription_info?.text;
    if (!payload.success || typeof text !== "string" || !text.trim()) {
      throw new Error("No clear household note was found in this recording.");
    }
    return { text: text.slice(0, 20_000), confidence: null };
  }
}

function config() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_AI_API_TOKEN;
  if (!accountId || !apiToken) throw new Error("Voice processing is not configured.");
  return { accountId, apiToken };
}
