"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createBillOrRenewalAction,
  type BillCaptureState,
} from "@/app/(workspace)/bills/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const initialState: BillCaptureState = { status: "idle", message: "" };

export function BillCapture({ sources }: { sources: Array<{ id: string; title: string }> }) {
  const [state, formAction] = useActionState(createBillOrRenewalAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <details id="bill-capture" className="mt-6 scroll-mt-24 rounded-md border bg-card">
      <summary className="cursor-pointer px-4 py-3 font-medium">Add bill or renewal</summary>
      <form ref={formRef} action={formAction} className="grid gap-4 border-t p-4 sm:grid-cols-2">
        <Field label="Type" htmlFor="bill-type">
          <Select id="bill-type" name="type" defaultValue="bill">
            <option value="bill">Bill</option>
            <option value="renewal">Renewal</option>
          </Select>
        </Field>
        <Field label="Date" htmlFor="bill-date">
          <Input id="bill-date" name="date" type="date" required />
        </Field>
        <Field label="Name" htmlFor="bill-title">
          <Input id="bill-title" name="title" minLength={2} maxLength={120} required placeholder="Electricity" />
        </Field>
        <Field label="Provider (optional)" htmlFor="bill-provider">
          <Input id="bill-provider" name="provider" maxLength={120} placeholder="Provider name" />
        </Field>
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="bill-source" className="text-sm font-medium">Original source (optional)</label>
          <Select id="bill-source" name="sourceReferenceId" defaultValue="">
            <option value="">No source selected</option>
            {sources.map((source) => <option key={source.id} value={source.id}>{source.title}</option>)}
          </Select>
        </div>
        <div className="sm:col-span-2">
          <SubmitButton />
          <p role="status" aria-live="polite" className={state.status === "error" ? "mt-3 text-sm text-destructive" : "mt-3 text-sm text-muted-foreground"}>
            {state.message}
          </p>
        </div>
      </form>
    </details>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>{children}</div>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save reminder"}</Button>;
}
