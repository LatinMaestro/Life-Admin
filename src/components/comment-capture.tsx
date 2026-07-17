"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createCommentAction,
  type CommentState,
} from "@/app/(workspace)/activity/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: CommentState = { status: "idle", message: "" };

export function CommentCapture({ targets }: { targets: Array<{ value: string; label: string }> }) {
  const [state, formAction] = useActionState(createCommentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <details id="comment-capture" className="mt-6 scroll-mt-24 rounded-md border bg-card">
      <summary className="cursor-pointer px-4 py-3 font-medium">Add comment</summary>
      <form ref={formRef} action={formAction} className="space-y-4 border-t p-4">
        <div className="space-y-2">
          <label htmlFor="comment-target" className="text-sm font-medium">Item</label>
          <Select id="comment-target" name="target" required defaultValue="">
            <option value="" disabled>Choose an item</option>
            {targets.map((target) => <option key={target.value} value={target.value}>{target.label}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <label htmlFor="comment-body" className="text-sm font-medium">Comment</label>
          <Textarea id="comment-body" name="body" maxLength={500} required placeholder="What should the household know?" />
        </div>
        <SubmitButton />
        <p role="status" aria-live="polite" className={state.status === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>{state.message}</p>
      </form>
    </details>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Add comment"}</Button>;
}
