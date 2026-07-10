const authMode = process.env.FAMILY_LIFE_ADMIN_AUTH_MODE ?? "demo";
const persistenceMode = process.env.FAMILY_LIFE_ADMIN_PERSISTENCE_MODE ?? "static";
const requireLive = process.argv.includes("--require-live");
const errors = [];

const validPairs = new Set(["demo:static", "clerk:prisma"]);
const modePair = `${authMode}:${persistenceMode}`;

if (!validPairs.has(modePair)) {
  errors.push(
    "Runtime modes must be paired as demo/static or clerk/prisma. Partial live activation is not allowed.",
  );
}

if (requireLive && modePair !== "clerk:prisma") {
  errors.push("Live activation check requires clerk authentication and Prisma persistence.");
}

if (authMode === "clerk") {
  requireValue("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  requireValue("CLERK_SECRET_KEY");

  if (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_")
  ) {
    errors.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY has an unexpected format.");
  }

  if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.startsWith("sk_")) {
    errors.push("CLERK_SECRET_KEY has an unexpected format.");
  }
}

if (persistenceMode === "prisma") {
  requireValue("DATABASE_URL");

  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const parsed = new URL(databaseUrl);
      if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
        errors.push("DATABASE_URL must use a PostgreSQL protocol.");
      }
      if (!parsed.hostname || !parsed.pathname || parsed.pathname === "/") {
        errors.push("DATABASE_URL must identify a database host and name.");
      }
    } catch {
      errors.push("DATABASE_URL must be a valid PostgreSQL connection URL.");
    }

    if (/USER|PASSWORD|HOST|DATABASE/i.test(databaseUrl)) {
      errors.push("DATABASE_URL still contains placeholder values.");
    }
  }
}

if (errors.length > 0) {
  console.error("Production activation configuration is invalid:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  modePair === "clerk:prisma"
    ? "Production activation configuration is complete."
    : "Static demo configuration is complete.",
);

function requireValue(name) {
  if (!process.env[name]?.trim()) {
    errors.push(`${name} is required for live activation.`);
  }
}
