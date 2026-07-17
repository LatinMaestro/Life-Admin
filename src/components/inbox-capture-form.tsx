"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createInboxItemAction,
  type InboxCaptureState,
} from "@/app/(workspace)/inbox/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const initialState: InboxCaptureState = { status: "idle", message: "" };

export function InboxCaptureForm() {
  const [state, formAction] = useActionState(createInboxItemAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="category" value="other" />
      <input type="hidden" name="destination" value="none" />
      <input type="hidden" name="priority" value="normal" />

      <div className="space-y-2">
        <label htmlFor="capture-title" className="text-sm font-medium">
          What is it?
        </label>
        <Input
          id="capture-title"
          name="title"
          minLength={2}
          maxLength={120}
          required
          placeholder="School form or home repair"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="capture-description" className="text-sm font-medium">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Textarea
          id="capture-description"
          name="description"
          maxLength={1000}
          placeholder="Anything the family should know"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SubmitButton />
        <p
          className={state.status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
          role="status"
          aria-live="polite"
        >
          {state.message}
        </p>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Add to inbox"}
    </Button>
  );
}
