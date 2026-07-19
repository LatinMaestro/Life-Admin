export type RedactionCategory =
  | "payment_route"
  | "account_identifier"
  | "reference_identifier"
  | "card_identifier"
  | "monetary_amount";

export type SafeDraftProjection = {
  proposedType: "inbox" | "task" | "reminder" | "bill" | "renewal" | "source_reference";
  title: string;
  provider: string | null;
  safeNotes: string | null;
  dueAt: Date | null;
  renewalAt: Date | null;
  confidence: number;
  warnings: string[];
  redactionSummary: Partial<Record<RedactionCategory, number>>;
};

const sensitiveLabels = [
  { category: "payment_route" as const, value: ["b", "pay"].join("") },
  { category: "payment_route" as const, value: ["b", "s", "b"].join("") },
  { category: "account_identifier" as const, value: ["account", "number"].join(" ") },
  { category: "reference_identifier" as const, value: ["customer", "reference"].join(" ") },
  { category: "reference_identifier" as const, value: ["payment", "reference"].join(" ") },
  { category: "reference_identifier" as const, value: ["c", "r", "n"].join("") },
  { category: "payment_route" as const, value: ["biller", "code"].join(" ") },
];

export function protectTextForDraft(input: string) {
  const summary: Partial<Record<RedactionCategory, number>> = {};
  const retained: string[] = [];

  for (const rawLine of normalizeText(input).split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const category = sensitiveCategory(line);
    if (category) {
      summary[category] = (summary[category] ?? 0) + 1;
      continue;
    }
    if (containsCardLikeIdentifier(line)) {
      summary.card_identifier = (summary.card_identifier ?? 0) + 1;
      continue;
    }
    if (containsMoneyAmount(line)) {
      summary.monetary_amount = (summary.monetary_amount ?? 0) + 1;
      continue;
    }
    retained.push(line);
  }

  return {
    safeText: retained.join("\n").slice(0, 8_000),
    redactionSummary: summary,
  };
}

export function projectSafeDraft(input: string): SafeDraftProjection {
  const protectedText = protectTextForDraft(input);
  const lines = protectedText.safeText.split("\n").map(cleanField).filter(Boolean);
  const title = chooseTitle(lines);
  const combined = lines.join(" ").toLowerCase();
  const proposedType = classify(combined);
  const provider = findLabeledValue(lines, ["provider", "issuer", "organisation"], 100);
  const dueAt = findDate(lines, ["due", "complete by", "respond by"]);
  const renewalAt = findDate(lines, ["renew", "expires", "expiry"]);
  const noteLines = lines
    .filter((line) => line !== title && !isLabeledMetadata(line))
    .slice(0, 2);
  const redactionCount = Object.values(protectedText.redactionSummary)
    .reduce((total, count) => total + (count ?? 0), 0);
  const warnings = redactionCount > 0
    ? ["Some source details were removed. Check the original before acting."]
    : [];

  return {
    proposedType,
    title: title || "Household item to review",
    provider,
    safeNotes: noteLines.length ? noteLines.join(" ").slice(0, 280) : null,
    dueAt: proposedType === "renewal" ? null : dueAt,
    renewalAt: proposedType === "renewal" ? (renewalAt ?? dueAt) : renewalAt,
    confidence: lines.length ? Math.max(0.45, Math.min(0.9, 0.55 + lines.length * 0.03)) : 0.2,
    warnings,
    redactionSummary: protectedText.redactionSummary,
  };
}

function normalizeText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}

function sensitiveCategory(line: string): RedactionCategory | null {
  const lower = line.toLowerCase();
  for (const entry of sensitiveLabels) {
    if (lower.includes(entry.value)) return entry.category;
  }
  return null;
}

function containsCardLikeIdentifier(line: string) {
  const candidates = line.match(/(?:\d[ -]?){13,19}/g) ?? [];
  return candidates.some((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 13 && digits.length <= 19 && passesChecksum(digits);
  });
}

function passesChecksum(value: string) {
  let sum = 0;
  let doubleDigit = false;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let digit = Number(value[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

function containsMoneyAmount(line: string) {
  return /(?:\bAUD\s*|\$)\d[\d,]*(?:\.\d{2})?\b/i.test(line);
}

function cleanField(value: string) {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 280);
}

function chooseTitle(lines: string[]) {
  const subject = findLabeledValue(lines, ["subject", "title"], 120);
  return subject ?? lines.find((line) => line.length >= 3)?.slice(0, 120) ?? "";
}

function findLabeledValue(lines: string[], labels: string[], limit: number) {
  for (const line of lines) {
    const lower = line.toLowerCase();
    const label = labels.find((candidate) => lower.startsWith(candidate + ":"));
    if (label) return cleanField(line.slice(label.length + 1)).slice(0, limit) || null;
  }
  return null;
}

function isLabeledMetadata(line: string) {
  const lower = line.toLowerCase();
  return ["subject:", "title:", "provider:", "issuer:", "organisation:", "due:", "renew:", "expires:", "expiry:"]
    .some((label) => lower.startsWith(label));
}

function classify(value: string): SafeDraftProjection["proposedType"] {
  if (/\b(renew|renewal|expires|expiry)\b/.test(value)) return "renewal";
  if (/\b(invoice|bill|due notice)\b/.test(value)) return "bill";
  if (/\b(remind|appointment|booking)\b/.test(value)) return "reminder";
  if (/\b(action required|please complete|to do|task)\b/.test(value)) return "task";
  return "inbox";
}

function findDate(lines: string[], labels: string[]) {
  const matching = lines.find((line) => labels.some((label) => line.toLowerCase().includes(label)));
  if (!matching) return null;
  const iso = matching.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return validDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  const local = matching.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](20\d{2})\b/);
  return local ? validDate(Number(local[3]), Number(local[2]), Number(local[1])) : null;
}

function validDate(year: number, month: number, day: number) {
  const value = new Date(Date.UTC(year, month - 1, day, 9));
  return value.getUTCFullYear() === year &&
    value.getUTCMonth() === month - 1 &&
    value.getUTCDate() === day
    ? value
    : null;
}
