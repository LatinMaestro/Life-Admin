import { SimpleCreateScreen } from "@/components/simple-create-screen";

export default function NewTaskScreen() {
  return (
    <SimpleCreateScreen
      endpoint="/api/v1/tasks"
      noteField="notes"
      notePlaceholder="Anything the household should know"
      submitLabel="Add task"
      titlePlaceholder="Task title"
    />
  );
}
