import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateField } from "@/components/date-field";
import { MemberField } from "@/components/member-field";
import { PrimaryButton } from "@/components/primary-button";
import { StatusView } from "@/components/ui";
import {
  toCalendarDateValue,
  useApiResource,
  useHouseholdMutation,
} from "@/lib/api";
import type { ItemDetailResponse, ItemEntityType } from "@/lib/contracts";
import { colors } from "@/lib/theme";

const entityTypes = new Set<ItemEntityType>([
  "inbox_item",
  "task",
  "reminder",
  "shopping_list",
  "bill_or_renewal",
  "source_reference",
]);

export default function EditItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ entityType?: string; itemId?: string }>();
  const entityType = entityTypes.has(params.entityType as ItemEntityType)
    ? (params.entityType as ItemEntityType)
    : "task";
  const itemId = typeof params.itemId === "string" ? params.itemId : "invalid";
  const state = useApiResource<ItemDetailResponse>(
    `/api/v1/items/${entityType}/${itemId}`,
  );
  const mutate = useHouseholdMutation();
  const [initialized, setInitialized] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState("");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("other");
  const [priority, setPriority] = useState("normal");
  const [assignedMemberId, setAssignedMemberId] = useState("");
  const [sourceReferenceId, setSourceReferenceId] = useState("");
  const [date, setDate] = useState(new Date());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialized || !state.data) return;
    const edit = state.data.item.edit;
    setTitle(edit.title);
    setDescription(edit.description ?? "");
    setProvider(edit.provider ?? "");
    setLabel(edit.label ?? "");
    setUrl(edit.url ?? "");
    setCategory(edit.category ?? "other");
    setPriority(edit.priority ?? "normal");
    setAssignedMemberId(edit.assignedMemberId ?? "");
    setSourceReferenceId(edit.sourceReferenceId ?? "");
    if (edit.date) setDate(new Date(edit.date));
    setInitialized(true);
  }, [initialized, state.data]);

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate(
        `/api/v1/items/${entityType}/${itemId}`,
        {
          title,
          description,
          provider,
          label,
          url,
          category,
          priority,
          assignedMemberId,
          sourceReferenceId,
          date: toCalendarDateValue(date),
        },
      );
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const archive = () => {
    Alert.alert(
      "Archive this item?",
      "It will leave the active household views but remain in activity history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setBusy(true);
              setMessage(null);
              try {
                await mutate(
                  `/api/v1/items/${entityType}/${itemId}`,
                  { archived: true },
                );
                router.dismissTo("/");
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Please try again.",
                );
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  };

  if (!state.data || !initialized) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <StatusView {...state} onRetry={() => void state.refresh()} />
      </SafeAreaView>
    );
  }

  const assignable = [
    "inbox_item",
    "task",
    "reminder",
    "bill_or_renewal",
  ].includes(entityType);
  const hasDate = ["task", "reminder", "bill_or_renewal"].includes(entityType);
  const hasDescription = ["inbox_item", "task", "reminder"].includes(entityType);
  const hasSource = ["inbox_item", "task", "bill_or_renewal"].includes(entityType);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Field label={entityType === "shopping_list" ? "List name" : "Title"}>
          <TextInput
            accessibilityLabel={entityType === "shopping_list" ? "List name" : "Title"}
            maxLength={entityType === "shopping_list" ? 80 : 120}
            onChangeText={setTitle}
            style={styles.input}
            value={title}
          />
        </Field>

        {entityType === "bill_or_renewal" ? (
          <Field label="Provider (optional)">
            <TextInput
              accessibilityLabel="Provider"
              maxLength={120}
              onChangeText={setProvider}
              style={styles.input}
              value={provider}
            />
          </Field>
        ) : null}

        {entityType === "source_reference" ? (
          <>
            <Field label="Source label">
              <TextInput
                accessibilityLabel="Source label"
                maxLength={160}
                onChangeText={setLabel}
                style={styles.input}
                value={label}
              />
            </Field>
            <Field label="HTTPS link (optional)">
              <TextInput
                accessibilityLabel="HTTPS link"
                autoCapitalize="none"
                keyboardType="url"
                maxLength={2000}
                onChangeText={setUrl}
                style={styles.input}
                value={url}
              />
            </Field>
          </>
        ) : null}

        {hasDescription ? (
          <Field label="Notes (optional)">
            <TextInput
              accessibilityLabel="Notes"
              maxLength={1000}
              multiline
              onChangeText={setDescription}
              style={[styles.input, styles.notes]}
              textAlignVertical="top"
              value={description}
            />
          </Field>
        ) : null}

        {entityType === "inbox_item" ? (
          <ChoiceField
            label="Category"
            value={category}
            onChange={setCategory}
            choices={[
              ["other", "Other"],
              ["school", "School"],
              ["appointment", "Appointment"],
              ["renewal", "Renewal"],
              ["household_admin", "Household admin"],
              ["shopping", "Shopping"],
            ]}
          />
        ) : null}

        {entityType === "inbox_item" || entityType === "task" ? (
          <ChoiceField
            label="Priority"
            value={priority}
            onChange={setPriority}
            choices={[
              ["low", "Low"],
              ["normal", "Normal"],
              ["high", "High"],
            ]}
          />
        ) : null}

        {hasDate ? (
          <DateField
            label={entityType === "reminder" ? "Reminder date" : "Date"}
            onChange={setDate}
            value={date}
          />
        ) : null}

        {assignable ? (
          <MemberField
            members={state.data.members.map((member) => ({
              ...member,
              initials: "",
              role: "household_member" as const,
            }))}
            onChange={setAssignedMemberId}
            value={assignedMemberId}
          />
        ) : null}

        {hasSource && state.data.sources.length > 0 ? (
          <ChoiceField
            label="Original source"
            value={sourceReferenceId}
            onChange={setSourceReferenceId}
            choices={[
              ["", "None"],
              ...state.data.sources.map((source) => [source.id, source.label] as [string, string]),
            ]}
          />
        ) : null}

        {entityType === "bill_or_renewal" ? (
          <Text style={styles.help}>
            This reminder links back to its original source. Payment instructions are never copied into app fields.
          </Text>
        ) : null}

        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          disabled={!title.trim() || (entityType === "source_reference" && !label.trim())}
          icon="checkmark"
          label="Save changes"
          onPress={() => void save()}
        />
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={archive}
          style={styles.archiveButton}
        >
          <Text style={styles.archiveText}>Archive item</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function ChoiceField({
  label,
  value,
  onChange,
  choices,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  choices: Array<[string, string]>;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View accessibilityRole="radiogroup" style={styles.choices}>
        {choices.map(([choice, text]) => {
          const selected = choice === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={choice || "none"}
              onPress={() => onChange(choice)}
              style={[styles.choice, selected && styles.choiceSelected]}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                {text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  form: { gap: 16, padding: 18 },
  field: { gap: 8 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    padding: 14,
  },
  notes: { minHeight: 100 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  choiceTextSelected: { color: "#FFFFFF" },
  help: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  archiveButton: {
    alignItems: "center",
    borderColor: colors.danger,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  archiveText: { color: colors.danger, fontSize: 15, fontWeight: "700" },
});
