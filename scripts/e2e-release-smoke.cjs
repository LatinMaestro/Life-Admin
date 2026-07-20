/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const baseUrl = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const routes = ["/", "/inbox", "/tasks", "/lists", "/bills", "/sources", "/activity", "/family", "/settings"];
const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];
const forbiddenProductTerms = [
  "cashflow",
  "cash flow",
  "bank import",
  "transaction tracking",
  "spend analysis",
  "net worth",
  "tax reporting",
  "loan balance",
];
const evidenceDirectory = path.resolve("test-results/release-smoke");
fs.mkdirSync(evidenceDirectory, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const failures = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        colorScheme: "light",
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      for (const route of routes) {
        const response = await page.goto(`${baseUrl}${route}`, {
          waitUntil: "networkidle",
          timeout: 30_000,
        });
        const label = `${viewport.name} ${route}`;

        if (!response?.ok()) {
          failures.push(`${label}: returned ${response?.status() ?? "no response"}`);
          continue;
        }

        await page.locator("main").waitFor({ state: "visible" });
        const audit = await page.evaluate((forbiddenTerms) => {
          const visible = (element) => {
            const style = getComputedStyle(element);
            const box = element.getBoundingClientRect();
            return style.visibility !== "hidden"
              && style.display !== "none"
              && box.width > 0
              && box.height > 0;
          };
          const unnamed = [...document.querySelectorAll("a,button,input,select,textarea")]
            .filter(visible)
            .filter((element) => {
              const text = element.textContent?.trim();
              const label = element.getAttribute("aria-label")
                || element.getAttribute("title")
                || element.getAttribute("placeholder");
              return !text && !label;
            })
            .map((element) => element.outerHTML.slice(0, 160));

          const text = document.body.innerText.toLowerCase();
          return {
            hasMain: Boolean(document.querySelector("main")),
            hasHeading: Boolean(document.querySelector("h1")),
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            unnamed,
            forbidden: forbiddenTerms.filter((term) => text.includes(term)),
          };
        }, forbiddenProductTerms);

        if (!audit.hasMain) failures.push(`${label}: missing main landmark`);
        if (!audit.hasHeading) failures.push(`${label}: missing page heading`);
        if (audit.horizontalOverflow) failures.push(`${label}: horizontal overflow`);
        if (audit.unnamed.length) failures.push(`${label}: unnamed controls ${audit.unnamed.join(" | ")}`);
        if (audit.forbidden.length) failures.push(`${label}: forbidden product terms ${audit.forbidden.join(", ")}`);

        const fileName = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
        await page.screenshot({
          path: path.join(evidenceDirectory, `${viewport.name}-${fileName}.png`),
          fullPage: true,
        });
      }

      if (consoleErrors.length) {
        failures.push(`${viewport.name}: browser errors: ${consoleErrors.slice(0, 5).join(" | ")}`);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error("Release smoke journeys failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Release smoke journeys passed across ${routes.length} routes and ${viewports.length} viewports.`);
})();
