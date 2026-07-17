"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createSourceReferenceAction,
  type SourceCaptureState,
} from "@/app/(workspace)/sources/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const initialState: SourceCaptureState = { status: "idle", message: "" };

export function SourceCapture() {
  const [state, formAction] = useActionState(createSourceReferenceAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <details id="source-capture" className="mt-6 scroll-mt-24 rounded-md border bg-card">
      <summary className="cursor-pointer px-4 py-3 font-medium">Add source</summary>
      <form ref={formRef} action={formAction} className="grid gap-4 border-t p-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="source-title">
          <Input id="source-title" name="title" minLength={2} maxLength={120} required placeholder="Electricity notice" />
        </Field>
        <Field label="Type" htmlFor="source-kind">
          <Select id="source-kind" name="kind" defaultValue="source_link">
            <option value="source_link">Web link</option>
            <option value="source_document_reference">Document reference</option>
            <option value="source_email_reference">Email reference</option>
            <option value="source_image_reference">Image reference</option>
          </Select>
        </Field>
        <Field label="Where is the original?" htmlFor="source-label">
          <Input id="source-label" name="label" minLength={2} maxLength={200} required placeholder="Provider portal or family email" />
        </Field>
        <Field label="Link (optional)" htmlFor="source-url">
          <Input id="source-url" name="url" type="url" placeholder="https://..." />
        </Field>
        <div className="sm:col-span-2">
          <SubmitButton />
          <p role="status" aria-live="polite" className={state.status === "error" ? "mt-3 text-sm text-destructive" : "mt-3 text-sm text-muted-foreground"}>{state.message}</p>
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
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save source"}</Button>;
}
