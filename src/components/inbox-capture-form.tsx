"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createInboxItemAction,
  type InboxCaptureState,
} from "@/app/(workspace)/inbox/actions";

const initialState: InboxCaptureState = {
  status: "idle",
  message: "",
};

export function InboxCaptureForm() {
  const [state, formAction] = useActionState(createInboxItemAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <label htmlFor="capture-title" className="text-sm font-medium">
          Title
        </label>
        <Input
          id="capture-title"
          name="title"
          minLength={2}
          maxLength={120}
          required
          placeholder="School form, home service note, or errand"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="capture-category" className="text-sm font-medium">
          Category
        </label>
        <Select id="capture-category" name="category" defaultValue="other">
          <option value="household_admin">Household admin</option>
          <option value="school">School</option>
          <option value="appointment">Appointment</option>
          <option value="renewal">Renewal</option>
          <option value="shopping">Shopping</option>
          <option value="other">Other</option>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="capture-destination" className="text-sm font-medium">
          Destination
        </label>
        <Select id="capture-destination" name="destination" defaultValue="task">
          <option value="task">Task</option>
          <option value="reminder">Reminder</option>
          <option value="bill_or_renewal">Bill or renewal</option>
          <option value="shopping_list">Shopping list</option>
          <option value="source_reference">Source reference</option>
          <option value="none">Decide later</option>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="capture-priority" className="text-sm font-medium">
          Priority
        </label>
        <Select id="capture-priority" name="priority" defaultValue="normal">
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </Select>
      </div>

      <div className="space-y-2 md:col-span-2">
        <label htmlFor="capture-description" className="text-sm font-medium">
          Notes
        </label>
        <Textarea
          id="capture-description"
          name="description"
          maxLength={1000}
          placeholder="What needs to happen, who is involved, and any timing to remember."
        />
      </div>

      <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row sm:items-center">
        <SubmitButton />
        <Button type="reset" variant="outline">
          Clear
        </Button>
        <p
          className={
            state.status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
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
      {pending ? "Saving..." : "Save inbox item"}
    </Button>
  );
}
