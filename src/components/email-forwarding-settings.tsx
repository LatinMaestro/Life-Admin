"use client";

import { Copy, Mail, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AliasResponse = {
  address: string | null;
  createdAt: string | null;
  error?: { message?: string };
};

export function EmailForwardingSettings() {
  const [data, setData] = useState<AliasResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      setData(await read(await fetch("/api/v1/email-intake", { cache: "no-store" })));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Forwarding is unavailable.");
    }
  }

  async function createOrRotate(confirmRotation = false) {
    if (
      confirmRotation &&
      !window.confirm("Replace this forwarding address? The old address will stop working.")
    ) return;
    setBusy(true);
    setMessage(null);
    try {
      const next = await read(
        await fetch("/api/v1/email-intake", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_or_rotate" }),
        }),
      );
      setData(next);
      setMessage("Forwarding address ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Forwarding could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  async function copyAddress() {
    if (!data?.address) return;
    await navigator.clipboard.writeText(data.address);
    setMessage("Address copied.");
  }

  return (
    <details className="mt-4 rounded-md border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-sm font-medium">
        <Mail className="h-4 w-4" aria-hidden="true" />
        Email forwarding
      </summary>
      <div className="space-y-4 border-t p-4">
        <p className="text-sm text-muted-foreground">
          Forward household notices here. They arrive in the inbox for review and never create reminders automatically.
        </p>
        {data?.address ? (
          <>
            <div className="flex gap-2">
              <Input aria-label="Household forwarding address" readOnly value={data.address} />
              <Button aria-label="Copy forwarding address" onClick={() => void copyAddress()} size="icon" type="button" variant="outline">
                <Copy className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <Button disabled={busy} onClick={() => void createOrRotate(true)} type="button" variant="outline">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Replace address
            </Button>
          </>
        ) : (
          <Button disabled={busy || data === null} onClick={() => void createOrRotate()} type="button">
            <Mail className="h-4 w-4" aria-hidden="true" />
            {busy ? "Setting up..." : "Set up forwarding"}
          </Button>
        )}
        <p aria-live="polite" className="text-sm text-muted-foreground" role="status">{message}</p>
      </div>
    </details>
  );
}

async function read(response: Response) {
  const body = (await response.json().catch(() => ({}))) as AliasResponse;
  if (!response.ok) throw new Error(body.error?.message ?? "Forwarding is unavailable.");
  return body;
}
