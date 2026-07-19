import "server-only";

import { createHmac } from "node:crypto";
import type { PrivateObjectStorage } from "@/lib/storage/contracts";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

export class R2PrivateObjectStorage implements PrivateObjectStorage {
  readonly provider = "r2" as const;

  async createUploadUrl(objectKey: string, expiresInSeconds: number) {
    return signR2Request("PUT", objectKey, expiresInSeconds);
  }

  async createReadUrl(objectKey: string, expiresInSeconds: number) {
    return signR2Request("GET", objectKey, expiresInSeconds);
  }

  async readObject(objectKey: string) {
    const response = await fetch(await this.createReadUrl(objectKey, 60), {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Private source retrieval failed with status ${response.status}.`);
    }
    return {
      bytes: new Uint8Array(await response.arrayBuffer()),
      contentType: response.headers.get("content-type"),
    };
  }

  async deleteObject(objectKey: string) {
    const response = await fetch(await signR2Request("DELETE", objectKey, 60), {
      method: "DELETE",
      cache: "no-store",
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(`Private source deletion failed with status ${response.status}.`);
    }
  }
}

async function signR2Request(
  method: "GET" | "PUT" | "DELETE",
  objectKey: string,
  expiresInSeconds: number,
) {
  const config = getR2Config();
  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replaceAll("-", "");
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const region = "auto";
  const service = "s3";
  const scope = `${dateStamp}/${region}/${service}/aws4_request`;
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const path = `/${encodePath(config.bucketName)}/${encodePath(objectKey)}`;
  const query = canonicalQuery({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${config.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(Math.min(Math.max(expiresInSeconds, 1), 900)),
    "X-Amz-SignedHeaders": "host",
  });
  const canonicalRequest = [
    method,
    path,
    query,
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    await sha256Hex(canonicalRequest),
  ].join("\n");
  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, region);
  const serviceKey = hmac(regionKey, service);
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  return `https://${host}${path}?${query}&X-Amz-Signature=${signature}`;
}

function getR2Config(): R2Config {
  const values = {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucketName: process.env.R2_BUCKET_NAME,
  };
  if (Object.values(values).some((value) => !value)) {
    throw new Error("Private source storage is not configured.");
  }
  return values as R2Config;
}

function encodePath(value: string) {
  return value.split("/").map(encodeRfc3986).join("/");
}

function canonicalQuery(values: Record<string, string>) {
  return Object.entries(values)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`)
    .join("&");
}

function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function hmac(key: string | Uint8Array, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

async function sha256Hex(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(digest).toString("hex");
}
