const OPERATION_PATHS = [
  "/api/internal/maintenance/cleanup",
  "/api/internal/notifications/dispatch",
];

export async function runScheduledOperations(env, fetchImpl = fetch) {
  const secret = env?.CRON_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("Operations scheduler secret is not configured.");
  }

  const baseUrl = new URL(env?.APP_BASE_URL ?? "");
  if (baseUrl.protocol !== "https:") {
    throw new Error("Operations scheduler requires an HTTPS app URL.");
  }

  const results = await Promise.all(
    OPERATION_PATHS.map(async (path) => {
      const response = await fetchImpl(new URL(path, baseUrl), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: "{}",
      });

      if (!response.ok) {
        throw new Error(`Scheduled operation failed with status ${response.status}.`);
      }

      return response.status;
    }),
  );

  return { completed: results.length };
}

export default {
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(runScheduledOperations(env));
  },
};
