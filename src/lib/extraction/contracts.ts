export type DocumentExtractionInput = {
  bytes: Uint8Array;
  mediaType: string;
  fileName: string;
};

export type DocumentExtractionResult = {
  text: string;
  strategy: "embedded_text" | "document_ocr";
  pageCount: number | null;
  confidence: number | null;
};

export interface DocumentExtractor {
  extract(input: DocumentExtractionInput): Promise<DocumentExtractionResult>;
}
