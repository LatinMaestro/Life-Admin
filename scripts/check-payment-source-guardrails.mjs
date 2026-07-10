import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const rootsToScan = ["src", "prisma"];
const extensionsToScan = new Set([".ts", ".tsx", ".js", ".jsx", ".prisma"]);

const forbiddenPatterns = [
  { label: "BPAY", pattern: /\bbpay\b/i },
  { label: "BSB", pattern: /\bbsbs?\b/i },
  { label: "CRN", pattern: /\bcrns?\b/i },
  { label: "biller code", pattern: /\bbiller\s+codes?\b/i },
  { label: "account number", pattern: /\baccount\s+numbers?\b/i },
  { label: "customer reference", pattern: /\bcustomer\s+references?\b/i },
  { label: "payment reference", pattern: /\bpayment\s+references?\b/i },
  { label: "structured payment ref", pattern: /\bpayment[_-]?refs?\b/i },
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && extensionsToScan.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
}

function getLineNumber(content, index) {
  return content.slice(0, index).split("\n").length;
}

const findings = [];

for (const root of rootsToScan) {
  const files = await collectFiles(root);

  for (const file of files) {
    const content = await readFile(file, "utf8");

    for (const forbidden of forbiddenPatterns) {
      const match = forbidden.pattern.exec(content);

      if (match) {
        findings.push({
          file,
          line: getLineNumber(content, match.index),
          label: forbidden.label,
        });
      }
    }
  }
}

if (findings.length > 0) {
  console.error("Forbidden payment identifier language found in app source:");

  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} (${finding.label})`);
  }

  console.error("Keep bill and renewal reminders source-reference-only. Docs may name these rules; app source must not store or display these identifiers.");
  process.exit(1);
}

console.log("Payment source-of-truth guardrail passed.");
