import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_DIRECT_SOURCE_BYTES,
  safeOriginalName,
  validateSourceBytes,
  validateSourceDeclaration,
} from "../src/lib/source-file-policy.ts";

test("accepts approved direct source types within the limit", () => {
  assert.doesNotThrow(() => validateSourceDeclaration("application/pdf", 1024));
  assert.doesNotThrow(() => validateSourceDeclaration("image/heic", MAX_DIRECT_SOURCE_BYTES));
});

test("rejects unsupported and oversized source declarations", () => {
  assert.throws(() => validateSourceDeclaration("application/zip", 100));
  assert.throws(() => validateSourceDeclaration("image/png", MAX_DIRECT_SOURCE_BYTES + 1));
});

test("checks PDF, JPEG, PNG, and HEIC signatures", () => {
  const cases = [
    ["application/pdf", Uint8Array.from(Buffer.from("%PDF-1.7"))],
    ["image/jpeg", Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])],
    ["image/png", Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
    ["image/heic", Uint8Array.from([0, 0, 0, 0x18, ...Buffer.from("ftypheic")])],
  ];
  for (const [type, bytes] of cases) {
    assert.doesNotThrow(() => validateSourceBytes(bytes, type, bytes.length));
  }
});

test("rejects a misleading declared file type", () => {
  const bytes = Uint8Array.from(Buffer.from("<script>unsafe</script>"));
  assert.throws(() => validateSourceBytes(bytes, "application/pdf", bytes.length));
});

test("removes path and control characters from original names", () => {
  assert.equal(safeOriginalName("../private\\notice\u0000.pdf"), "notice.pdf");
});
