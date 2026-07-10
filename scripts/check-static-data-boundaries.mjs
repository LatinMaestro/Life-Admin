import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const rootsToScan = ["src/app", "src/components"];
const extensionsToScan = new Set([".ts", ".tsx"]);
const forbiddenModules = [
  "@/lib/demo-data",
  "@/lib/collaboration-data",
  "@/lib/household",
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

    for (const moduleName of forbiddenModules) {
      const index = content.indexOf(`"${moduleName}"`);
      const singleQuoteIndex = content.indexOf(`'${moduleName}'`);
      const matchIndex = index >= 0 ? index : singleQuoteIndex;

      if (matchIndex >= 0) {
        findings.push({
          file,
          line: getLineNumber(content, matchIndex),
          moduleName,
        });
      }
    }
  }
}

if (findings.length > 0) {
  console.error("Direct static-data imports found in app or component source:");

  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} (${finding.moduleName})`);
  }

  console.error("Read household data through a server read model and the persistence adapter boundary.");
  process.exit(1);
}

console.log("Static data boundary guardrail passed.");
