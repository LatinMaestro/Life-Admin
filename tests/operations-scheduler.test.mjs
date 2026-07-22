import assert from "node:assert/strict";
import test from "node:test";

import { runScheduledOperations } from "../workers/operations-scheduler/index.mjs";

const env = {
  APP_BASE_URL: "https://lifeadmin.grovekind.com",
  CRON_SECRET: "s".repeat(48),
};

test("scheduler calls both private operations with the shared bearer secret", async () => {
  const calls = [];
  const result = await runScheduledOperations(env, async (url, init) => {
    calls.push({ url: String(url), init });
    return { ok: true, status: 204 };
  });

  assert.deepEqual(result, { completed: 2 });
  assert.deepEqual(
    calls.map((call) => call.url),
    [
      "https://lifeadmin.grovekind.com/api/internal/maintenance/cleanup",
      "https://lifeadmin.grovekind.com/api/internal/notifications/dispatch",
    ],
  );

  for (const call of calls) {
    assert.equal(call.init.method, "POST");
    assert.equal(call.init.headers.Authorization, `Bearer ${env.CRON_SECRET}`);
    assert.equal(call.init.body, "{}");
  }
});

test("scheduler rejects missing secrets and non-HTTPS targets", async () => {
  await assert.rejects(
    () => runScheduledOperations({ ...env, CRON_SECRET: "short" }, async () => {}),
    /secret is not configured/,
  );
  await assert.rejects(
    () => runScheduledOperations({ ...env, APP_BASE_URL: "http://example.test" }, async () => {}),
    /requires an HTTPS app URL/,
  );
});

test("scheduler fails when either operation is rejected", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      runScheduledOperations(env, async () => {
        calls += 1;
        return calls === 1
          ? { ok: true, status: 204 }
          : { ok: false, status: 503 };
      }),
    /status 503/,
  );
});
