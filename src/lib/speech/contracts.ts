export type SpeechTranscriptionInput = {
  bytes: Uint8Array;
  mediaType: string;
};

export type SpeechTranscriptionResult = {
  text: string;
  confidence: number | null;
};

export interface SpeechTranscriber {
  transcribe(input: SpeechTranscriptionInput): Promise<SpeechTranscriptionResult>;
}
