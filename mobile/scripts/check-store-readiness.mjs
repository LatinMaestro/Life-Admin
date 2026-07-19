import { access, readFile } from "node:fs/promises";

const requireLive = process.argv.includes("--require-live");
const app = JSON.parse(await readFile(new URL("../app.json", import.meta.url), "utf8")).expo;
const eas = JSON.parse(await readFile(new URL("../eas.json", import.meta.url), "utf8"));
const store = JSON.parse(await readFile(new URL("../store.config.json", import.meta.url), "utf8"));
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
if (eas.submit?.production?.ios?.metadataPath !== "./store.config.json") {
  errors.push("The iOS submission profile must use the checked-in store metadata.");
}

const appleInfo = store.apple?.info?.["en-AU"];
if (store.configVersion !== 0 || !appleInfo) {
  errors.push("English (Australia) App Store metadata is required.");
} else {
  if (appleInfo.title !== app.name) errors.push("The App Store title must match the app display name.");
  if (!appleInfo.subtitle || appleInfo.subtitle.length > 30) {
    errors.push("The App Store subtitle must be present and no longer than 30 characters.");
  }
  if (!appleInfo.description) errors.push("The App Store description is required.");
  if (Buffer.byteLength((appleInfo.keywords ?? []).join(","), "utf8") > 100) {
    errors.push("App Store keywords must fit the 100-byte limit.");
  }
  if (appleInfo.supportUrl !== "https://lifeadmin.grovekind.com/support") {
    errors.push("The App Store support URL must use the production Grovekind page.");
  }
  if (appleInfo.privacyPolicyUrl !== "https://lifeadmin.grovekind.com/privacy") {
    errors.push("The App Store privacy URL must use the production Grovekind page.");
  }
  if (appleInfo.privacyChoicesUrl !== "https://lifeadmin.grovekind.com/account-deletion") {
    errors.push("The App Store privacy choices URL must use the production account-deletion page.");
  }
}

const plugins = new Map(
  (app.plugins ?? []).map((plugin) => [
    Array.isArray(plugin) ? plugin[0] : plugin,
    Array.isArray(plugin) ? plugin[1] : undefined,
  ]),
);
const forbiddenPlugins = ["expo-camera", "expo-av"];
for (const name of plugins.keys()) {
  if (forbiddenPlugins.includes(name)) errors.push(`${name} is outside the approved first-store scope.`);
}

const imagePicker = plugins.get("expo-image-picker");
if (!imagePicker || imagePicker.microphonePermission !== false) {
  errors.push("Reviewed image capture must disable microphone access.");
}
const blockedPermissions = new Set(app.android?.blockedPermissions ?? []);
if (blockedPermissions.has("android.permission.CAMERA")) {
  errors.push("Camera permission cannot be blocked after reviewed capture is enabled.");
}
const audio = plugins.get("expo-audio");
if (!audio || audio.enableBackgroundRecording !== false || audio.recordAudioAndroid !== true) {
  errors.push("Voice capture must be foreground-only with explicit microphone permission.");
}
if (blockedPermissions.has("android.permission.RECORD_AUDIO")) {
  errors.push("Microphone permission cannot be blocked after voice capture is enabled.");
}
const notifications = plugins.get("expo-notifications");
if (!notifications || notifications.enableBackgroundRemoteNotifications !== false) {
  errors.push("Push notifications must be configured without background remote execution.");
}
if (blockedPermissions.has("android.permission.POST_NOTIFICATIONS")) {
  errors.push("Notification permission cannot be blocked after private opt-in notifications are enabled.");
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
  if (!app.extra?.eas?.projectId) {
    errors.push("The Expo EAS project ID must be linked for a live release.");
  }
}

if (errors.length > 0) {
  console.error("Mobile store readiness check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(requireLive ? "Live mobile release configuration passed." : "Mobile store structure passed.");
