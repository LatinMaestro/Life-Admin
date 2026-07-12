"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createShoppingItemAction,
  createShoppingListAction,
  type ShoppingCaptureState,
} from "@/app/(workspace)/lists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const initialState: ShoppingCaptureState = { status: "idle", message: "" };

export function ShoppingCapture({ lists }: { lists: Array<{ id: string; name: string }> }) {
  return (
    <div id="shopping-capture" className="mt-6 grid scroll-mt-24 gap-3 md:grid-cols-2">
      <details className="rounded-md border bg-card">
        <summary className="cursor-pointer px-4 py-3 font-medium">New list</summary>
        <CaptureForm action={createShoppingListAction} submitLabel="Create list">
          <Field label="List name" htmlFor="list-name">
            <Input id="list-name" name="name" minLength={2} maxLength={80} required placeholder="Groceries" />
          </Field>
        </CaptureForm>
      </details>

      <details className="rounded-md border bg-card">
        <summary className="cursor-pointer px-4 py-3 font-medium">Add item</summary>
        <CaptureForm action={createShoppingItemAction} submitLabel="Add item">
          <Field label="List" htmlFor="item-list">
            <Select id="item-list" name="shoppingListId" required defaultValue="">
              <option value="" disabled>Choose a list</option>
              {lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
            </Select>
          </Field>
          <Field label="Item" htmlFor="item-label">
            <Input id="item-label" name="label" maxLength={120} required placeholder="Milk" />
          </Field>
          <Field label="Quantity (optional)" htmlFor="item-quantity">
            <Input id="item-quantity" name="quantity" maxLength={40} placeholder="2" />
          </Field>
          <input type="hidden" name="category" value="" />
          <input type="hidden" name="notes" value="" />
        </CaptureForm>
      </details>
    </div>
  );
}

function CaptureForm({ action, submitLabel, children }: {
  action: (previousState: ShoppingCaptureState, formData: FormData) => Promise<ShoppingCaptureState>;
  submitLabel: string;
  children: ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 border-t p-4">
      {children}
      <SubmitButton label={submitLabel} />
      <p role="status" aria-live="polite" className={state.status === "error" ? "min-h-5 text-sm text-destructive" : "min-h-5 text-sm text-muted-foreground"}>
        {state.message}
      </p>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <div className="space-y-2"><label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>{children}</div>;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : label}</Button>;
}
