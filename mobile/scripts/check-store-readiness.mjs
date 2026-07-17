import { readFile } from "node:fs/promises";

const requireLive = process.argv.includes("--require-live");
const app = JSON.parse(await readFile(new URL("../app.json", import.meta.url), "utf8")).expo;
const eas = JSON.parse(await readFile(new URL("../eas.json", import.meta.url), "utf8"));
const errors = [];
const expectedIdentifier = "com.latinmaestro.familylifeadmin";

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

const forbiddenPlugins = ["expo-camera", "expo-image-picker", "expo-notifications", "expo-av"];
for (const plugin of app.plugins ?? []) {
  const name = Array.isArray(plugin) ? plugin[0] : plugin;
  if (forbiddenPlugins.includes(name)) errors.push(`${name} is outside the approved first-store scope.`);
}

if (requireLive) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? "";
  const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  if (!apiUrl.startsWith("https://") || apiUrl.includes("localhost") || apiUrl.includes("vercel.app")) {
    errors.push("EXPO_PUBLIC_API_URL must use the approved custom production domain.");
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
