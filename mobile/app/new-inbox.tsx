import { SimpleCreateScreen } from "@/components/simple-create-screen";

export default function NewInboxScreen() {
  return (
    <SimpleCreateScreen
      endpoint="/api/v1/inbox"
      noteField="description"
      notePlaceholder="A little more context"
      submitLabel="Add to inbox"
      titlePlaceholder="Inbox item"
    />
  );
}
