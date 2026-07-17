import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const routesRoot = path.join("src", "app", "api", "v1");
const responseBoundary = path.join("src", "lib", "api", "v1", "response.ts");

async function collectRouteFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectRouteFiles(entryPath)));
    } else if (entry.isFile() && entry.name === "route.ts") {
      files.push(entryPath);
    }
  }

  return files;
}

const routeFiles = await collectRouteFiles(routesRoot);
const findings = [];

for (const routeFile of routeFiles) {
  const content = await readFile(routeFile, "utf8");

  if (!content.includes("withHouseholdApi")) {
    findings.push(`${routeFile} does not use the household API boundary`);
  }

  if (!content.includes('dynamic = "force-dynamic"')) {
    findings.push(`${routeFile} is not explicitly dynamic`);
  }
}

const boundary = await readFile(responseBoundary, "utf8");
const requiredBoundarySignals = [
  "isClerkAuthenticationEnabled",
  "await auth()",
  "getCurrentHouseholdAccessContext",
  "private, no-store",
];

for (const signal of requiredBoundarySignals) {
  if (!boundary.includes(signal)) {
    findings.push(`${responseBoundary} is missing ${signal}`);
  }
}

if (routeFiles.length < 7) {
  findings.push("Expected bootstrap and six module read routes.");
}

if (findings.length > 0) {
  console.error("Mobile API boundary guardrail failed:");

  for (const finding of findings) {
    console.error(`- ${finding}`);
  }

  process.exit(1);
}

console.log(`Mobile API boundary guardrail passed for ${routeFiles.length} routes.`);
