"use client";

import type { ReactNode } from "react";
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createReminderAction,
  createTaskAction,
  type WorkCaptureState,
} from "@/app/(workspace)/tasks/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: WorkCaptureState = { status: "idle", message: "" };

type CaptureAction = (
  previousState: WorkCaptureState,
  formData: FormData,
) => Promise<WorkCaptureState>;

export function TaskReminderCapture() {
  return (
    <div id="capture-work" className="mt-6 grid scroll-mt-24 gap-3 md:grid-cols-2">
      <details className="rounded-md border bg-card">
        <summary className="cursor-pointer px-4 py-3 font-medium">Add task</summary>
        <CaptureForm action={createTaskAction} submitLabel="Add task">
          <TextField
            id="task-title"
            name="title"
            label="What needs doing?"
            placeholder="Book the plumber"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priority" htmlFor="task-priority">
              <Select id="task-priority" name="priority" defaultValue="normal">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </Select>
            </Field>
            <Field label="Due date (optional)" htmlFor="task-due">
              <Input id="task-due" name="dueAt" type="date" />
            </Field>
          </div>
          <NotesField id="task-notes" />
        </CaptureForm>
      </details>

      <details className="rounded-md border bg-card">
        <summary className="cursor-pointer px-4 py-3 font-medium">Add reminder</summary>
        <CaptureForm action={createReminderAction} submitLabel="Add reminder">
          <TextField
            id="reminder-title"
            name="title"
            label="What should you remember?"
            placeholder="Renew library books"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Repeat" htmlFor="reminder-cadence">
              <Select id="reminder-cadence" name="cadence" defaultValue="once">
                <option value="once">Once</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </Select>
            </Field>
            <Field label="Date" htmlFor="reminder-date">
              <Input id="reminder-date" name="remindAt" type="date" required />
            </Field>
          </div>
          <NotesField id="reminder-notes" />
        </CaptureForm>
      </details>
    </div>
  );
}

function CaptureForm({
  action,
  submitLabel,
  children,
}: {
  action: CaptureAction;
  submitLabel: string;
  children: ReactNode;
}) {
  const [state, formAction] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 border-t p-4">
      {children}
      <SubmitButton label={submitLabel} />
      <p
        role="status"
        aria-live="polite"
        className={state.status === "error" ? "min-h-5 text-sm text-destructive" : "min-h-5 text-sm text-muted-foreground"}
      >
        {state.message}
      </p>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function TextField({ id, name, label, placeholder }: { id: string; name: string; label: string; placeholder: string }) {
  return (
    <Field label={label} htmlFor={id}>
      <Input id={id} name={name} minLength={2} maxLength={120} placeholder={placeholder} required />
    </Field>
  );
}

function NotesField({ id }: { id: string }) {
  return (
    <Field label="Notes (optional)" htmlFor={id}>
      <Textarea id={id} name="notes" maxLength={1000} />
    </Field>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending}>{pending ? "Saving..." : label}</Button>;
}
