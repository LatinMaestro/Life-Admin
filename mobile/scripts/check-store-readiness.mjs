import { access, readFile } from "node:fs/promises";

const requireLive = process.argv.includes("--require-live");
const app = JSON.parse(await readFile(new URL("../app.json", import.meta.url), "utf8")).expo;
const eas = JSON.parse(await readFile(new URL("../eas.json", import.meta.url), "utf8"));
const errors = [];
const expectedIdentifier = "com.latinmaestro.familylifeadmin";
const projectRoot = new URL("../", import.meta.url);

if (app.name !== "Family Life Admin") errors.push("The app display name has changed.");
if (app.version !== "1.0.0") errors.push("The first store version must be 1.0.0.");
if (app.ios?.bundleIdentifier !== expectedIdentifier) errors.push("The iOS identifier is missing or unexpected.");
if (app.android?.package !== expectedIdentifier) errors.push("The Android package is missing or unexpected.");
if (!app.ios?.buildNumber || !Number.isInteger(app.android?.versionCode)) {
  errors.push("Native build versions must be configured.");
}
if (app.ios?.infoPlist?.ITSAppUsesNonExemptEncryption !== false) {
  errors.push("The iOS encryption declaration must be explicit.");
}
if (!eas.build?.preview || !eas.build?.production || !eas.submit?.production) {
  errors.push("Preview, production, and submission profiles are required.");
}
if (eas.build?.production?.credentialsSource !== "remote") {
  errors.push("Production signing credentials must be remotely managed.");
}

const plugins = new Map(
  (app.plugins ?? []).map((plugin) => [
    Array.isArray(plugin) ? plugin[0] : plugin,
    Array.isArray(plugin) ? plugin[1] : undefined,
  ]),
);
const forbiddenPlugins = ["expo-camera", "expo-image-picker", "expo-notifications", "expo-av"];
for (const name of plugins.keys()) {
  if (forbiddenPlugins.includes(name)) errors.push(`${name} is outside the approved first-store scope.`);
}

const splash = plugins.get("expo-splash-screen");
if (!splash || splash.backgroundColor !== "#F7F8F5" || splash.image !== "./assets/splash-icon.png") {
  errors.push("The approved native splash screen is not configured.");
}

const requiredAssets = [
  [app.icon, "App icon"],
  [app.android?.adaptiveIcon?.foregroundImage, "Android adaptive icon"],
  [app.android?.adaptiveIcon?.monochromeImage, "Android monochrome icon"],
  [splash?.image, "Splash icon"],
];
for (const [assetPath, label] of requiredAssets) {
  if (!assetPath) {
    errors.push(`${label} is not configured.`);
    continue;
  }
  try {
    await access(new URL(assetPath, projectRoot));
  } catch {
    errors.push(`${label} is missing at ${assetPath}.`);
  }
}

if (requireLive) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
  const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  let apiHostname = "";
  try {
    const parsedApiUrl = new URL(apiUrl);
    apiHostname = parsedApiUrl.protocol === "https:" ? parsedApiUrl.hostname : "";
  } catch {
    apiHostname = "";
  }
  if (apiHostname !== "lifeadmin.grovekind.com") {
    errors.push("EXPO_PUBLIC_API_URL must use https://lifeadmin.grovekind.com.");
  }
  if (!clerkKey.startsWith("pk_live_")) {
    errors.push("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must be a production Clerk key.");
  }
}

if (errors.length > 0) {
  console.error("Mobile store readiness check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(requireLive ? "Live mobile release configuration passed." : "Mobile store structure passed.");
