const MAX_MESSAGE_BYTES = 20 * 1024 * 1024;

export default {
  async email(message, env) {
    const raw = new Uint8Array(await new Response(message.raw).arrayBuffer());
    if (raw.byteLength < 1 || raw.byteLength > MAX_MESSAGE_BYTES) {
      message.setReject("Message is outside the accepted size.");
      return;
    }

    const timestamp = String(Math.floor(Date.now() / 1000));
    const recipient = message.to.toLowerCase();
    const eventId = await sha256Hex(raw);
    const signature = await hmacHex(
      env.EMAIL_WEBHOOK_SECRET,
      `${timestamp}.${recipient}.${eventId}`,
    );
    const response = await fetch(env.INTAKE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "message/rfc822",
        "X-LifeAdmin-Timestamp": timestamp,
        "X-LifeAdmin-Recipient": recipient,
        "X-LifeAdmin-Event": eventId,
        "X-LifeAdmin-Signature": signature,
      },
      body: raw,
    });

    if (response.status >= 400 && response.status < 500) {
      message.setReject("This household intake address could not accept the message.");
      return;
    }
    if (!response.ok) {
      throw new Error(`Household intake returned ${response.status}.`);
    }
  },
};

async function sha256Hex(value) {
  return hex(await crypto.subtle.digest("SHA-256", value));
}

async function hmacHex(secret, value) {
  if (!secret || secret.length < 32) throw new Error("Email webhook secret is not configured.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

function hex(value) {
  return [...new Uint8Array(value)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
