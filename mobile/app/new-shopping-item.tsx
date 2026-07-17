import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { ShoppingResponse } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function NewShoppingItemScreen() {
  const router = useRouter();
  const state = useApiResource<ShoppingResponse>("/api/v1/shopping");
  const mutate = useHouseholdMutation();
  const lists = (state.data?.lists ?? []).filter((list) => list.status === "active");
  const [shoppingListId, setShoppingListId] = useState("");
  const [label, setLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!shoppingListId && lists[0]) setShoppingListId(lists[0].id);
  }, [lists, shoppingListId]);

  const submit = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate("/api/v1/shopping", { shoppingListId, label, notes }, "POST");
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!state.data) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        <StatusView {...state} onRetry={() => void state.refresh()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>List</Text>
        <View style={styles.choices}>
          {lists.map((list) => {
            const selected = shoppingListId === list.id;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={list.id}
                onPress={() => setShoppingListId(list.id)}
                style={[styles.choice, selected && styles.choiceSelected]}
              >
                <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>
                  {list.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {lists.length === 0 ? (
          <Text style={styles.help}>Create a shopping list in the web app first.</Text>
        ) : (
          <>
            <Text style={styles.label}>What do you need?</Text>
            <TextInput
              accessibilityLabel="Shopping item"
              autoFocus
              maxLength={120}
              onChangeText={setLabel}
              placeholder="Shopping item"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={label}
            />
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              accessibilityLabel="Optional notes"
              maxLength={500}
              onChangeText={setNotes}
              placeholder="Brand, size, or other detail"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={notes}
            />
            {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
            <PrimaryButton
              busy={busy}
              icon="checkmark"
              label="Add item"
              onPress={() => void submit()}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  form: { gap: 12, padding: 18 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  help: { color: colors.muted, fontSize: 15, lineHeight: 21 },
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
  choiceText: { color: colors.text, fontSize: 15, fontWeight: "600" },
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
