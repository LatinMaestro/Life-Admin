import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateField } from "@/components/date-field";
import { PrimaryButton } from "@/components/primary-button";
import { StatusView } from "@/components/ui";
import { toCalendarDateValue, useApiResource, useHouseholdMutation } from "@/lib/api";
import type { ItemDetailResponse, ShoppingResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

type Destination =
  | "task"
  | "reminder"
  | "bill_or_renewal"
  | "shopping_list"
  | "source_reference";

const destinationChoices: Array<[Destination, string]> = [
  ["task", "Task"],
  ["reminder", "Reminder"],
  ["bill_or_renewal", "Bill or renewal"],
  ["shopping_list", "Shopping"],
  ["source_reference", "Source"],
];

export default function RouteInboxScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ itemId?: string }>();
  const itemId = typeof params.itemId === "string" ? params.itemId : "invalid";
  const detail = useApiResource<ItemDetailResponse>(
    `/api/v1/items/inbox_item/${itemId}`,
  );
  const shopping = useApiResource<ShoppingResponse>("/api/v1/shopping");
  const mutate = useHouseholdMutation();
  const lists = (shopping.data?.lists ?? []).filter((list) => list.status === "active");
  const [destination, setDestination] = useState<Destination>("task");
  const [date, setDate] = useState(() => {
    const value = new Date();
    value.setDate(value.getDate() + 1);
    return value;
  });
  const [reminderType, setReminderType] = useState<"bill" | "renewal">("bill");
  const [provider, setProvider] = useState("");
  const [shoppingListId, setShoppingListId] = useState("");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shoppingListId && lists[0]) setShoppingListId(lists[0].id);
  }, [lists, shoppingListId]);

  useEffect(() => {
    if (!label && detail.data?.item.source?.label) {
      setLabel(detail.data.item.source.label);
    }
  }, [detail.data?.item.source?.label, label]);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate(
        `/api/v1/inbox/${itemId}/route`,
        {
          destination,
          date: toCalendarDateValue(date),
          reminderType,
          provider,
          shoppingListId,
          label: label || "Original household source",
          url,
        },
        "POST",
      );
      router.dismissTo("/(tabs)/inbox");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!detail.data) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <StatusView {...detail} onRetry={() => void detail.refresh()} />
      </SafeAreaView>
    );
  }

  const disabled =
    (destination === "shopping_list" && !shoppingListId) ||
    (destination === "source_reference" && !label.trim());

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>{detail.data.item.title}</Text>
          <Text style={styles.help}>
            Choose where this belongs. The original inbox item will stay in its history.
          </Text>
        </View>

        <ChoiceField
          label="Turn into"
          value={destination}
          onChange={(value) => setDestination(value as Destination)}
          choices={destinationChoices}
        />

        {["task", "reminder", "bill_or_renewal"].includes(destination) ? (
          <DateField
            label={destination === "reminder" ? "Reminder date" : "Date"}
            onChange={setDate}
            value={date}
          />
        ) : null}

        {destination === "bill_or_renewal" ? (
          <>
            <ChoiceField
              label="Reminder type"
              value={reminderType}
              onChange={(value) => setReminderType(value as "bill" | "renewal")}
              choices={[
                ["bill", "Bill reminder"],
                ["renewal", "Renewal reminder"],
              ]}
            />
            <Text style={styles.label}>Provider (optional)</Text>
            <TextInput
              accessibilityLabel="Provider"
              maxLength={120}
              onChangeText={setProvider}
              style={styles.input}
              value={provider}
            />
            <Text style={styles.safety}>
              Only the due or renewal date and source link are kept. Payment instructions remain in the original source.
            </Text>
          </>
        ) : null}

        {destination === "shopping_list" ? (
          <>
            <ChoiceField
              label="Shopping list"
              value={shoppingListId}
              onChange={setShoppingListId}
              choices={lists.map((list) => [list.id, list.name])}
            />
            {lists.length === 0 ? (
              <Text style={styles.error}>Create a shopping list before sorting this item.</Text>
            ) : null}
          </>
        ) : null}

        {destination === "source_reference" && !detail.data.item.source ? (
          <>
            <Text style={styles.label}>Source label</Text>
            <TextInput
              accessibilityLabel="Source label"
              maxLength={160}
              onChangeText={setLabel}
              placeholder="For example, School email"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={label}
            />
            <Text style={styles.label}>HTTPS link (optional)</Text>
            <TextInput
              accessibilityLabel="HTTPS link"
              autoCapitalize="none"
              keyboardType="url"
              maxLength={2000}
              onChangeText={setUrl}
              style={styles.input}
              value={url}
            />
          </>
        ) : null}

        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          disabled={disabled}
          icon="checkmark"
          label="Sort inbox item"
          onPress={() => void submit()}
        />
      </ScrollView>
    </SafeAreaView>
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
  choices: ReadonlyArray<readonly [string, string]>;
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
              key={choice}
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
  intro: { gap: 6 },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  help: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  safety: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  field: { gap: 8 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 13,
  },
  choiceSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  choiceText: { color: colors.text, fontSize: 14, fontWeight: "600" },
  choiceTextSelected: { color: "#FFFFFF" },
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
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
