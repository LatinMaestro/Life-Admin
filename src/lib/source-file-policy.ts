export const MAX_DIRECT_SOURCE_BYTES = 15 * 1024 * 1024;

export const allowedSourceMediaTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;

export type AllowedSourceMediaType = (typeof allowedSourceMediaTypes)[number];

export function validateSourceDeclaration(mediaType: string, byteSize: number) {
  if (!allowedSourceMediaTypes.includes(mediaType as AllowedSourceMediaType)) {
    throw new Error("Choose a PDF, JPEG, PNG, or HEIC file.");
  }
  if (!Number.isSafeInteger(byteSize) || byteSize < 1 || byteSize > MAX_DIRECT_SOURCE_BYTES) {
    throw new Error("Choose a file smaller than 15 MB.");
  }
}

export function validateSourceBytes(
  bytes: Uint8Array,
  declaredMediaType: AllowedSourceMediaType,
  declaredByteSize: number,
) {
  if (bytes.byteLength !== declaredByteSize || bytes.byteLength > MAX_DIRECT_SOURCE_BYTES) {
    throw new Error("The uploaded file size did not match the selected file.");
  }
  if (!matchesMagicBytes(bytes, declaredMediaType)) {
    throw new Error("The selected file contents did not match its file type.");
  }
}

export function safeOriginalName(value: string) {
  const name = value.replaceAll("\\", "/").split("/").pop()?.trim() ?? "source";
  const cleaned = name.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 180);
  return cleaned || "source";
}

function matchesMagicBytes(bytes: Uint8Array, mediaType: AllowedSourceMediaType) {
  if (mediaType === "application/pdf") {
    return ascii(bytes, 0, 5) === "%PDF-";
  }
  if (mediaType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mediaType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      ascii(bytes, 1, 3) === "PNG" &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  if (mediaType === "image/heic" || mediaType === "image/heif") {
    const box = ascii(bytes, 4, 12);
    return box.startsWith("ftyp") && ["heic", "heix", "hevc", "hevx", "mif1", "msf1"].includes(box.slice(4, 8));
  }
  return false;
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}
