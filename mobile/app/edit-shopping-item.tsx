import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { useHouseholdMutation } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function EditShoppingItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    itemId?: string;
    label?: string;
    notes?: string;
    quantity?: string;
    category?: string;
  }>();
  const itemId = typeof params.itemId === "string" ? params.itemId : "invalid";
  const [label, setLabel] = useState(typeof params.label === "string" ? params.label : "");
  const [notes, setNotes] = useState(typeof params.notes === "string" ? params.notes : "");
  const [quantity, setQuantity] = useState(
    typeof params.quantity === "string" ? params.quantity : "",
  );
  const [category, setCategory] = useState(
    typeof params.category === "string" ? params.category : "",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const mutate = useHouseholdMutation();

  const save = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await mutate(
        `/api/v1/shopping/items/${itemId}`,
        { label, notes, quantity, category },
      );
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = () => {
    Alert.alert(
      "Remove this item?",
      "It will be removed from the shopping list.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setBusy(true);
              try {
                await mutate(`/api/v1/shopping/items/${itemId}`, {}, "DELETE");
                router.back();
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Please try again.");
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Item</Text>
        <TextInput
          accessibilityLabel="Shopping item"
          autoFocus
          maxLength={120}
          onChangeText={setLabel}
          style={styles.input}
          value={label}
        />
        <Text style={styles.label}>Quantity (optional)</Text>
        <TextInput
          accessibilityLabel="Quantity"
          maxLength={80}
          onChangeText={setQuantity}
          placeholder="For example, 2"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={quantity}
        />
        <Text style={styles.label}>Category (optional)</Text>
        <TextInput
          accessibilityLabel="Category"
          maxLength={80}
          onChangeText={setCategory}
          placeholder="For example, Produce"
          placeholderTextColor={colors.muted}
          style={styles.input}
          value={category}
        />
        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          accessibilityLabel="Notes"
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
          disabled={!label.trim()}
          icon="checkmark"
          label="Save changes"
          onPress={() => void save()}
        />
        <Text
          accessibilityRole="button"
          onPress={remove}
          style={styles.remove}
        >
          Remove item
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  form: { gap: 12, padding: 18 },
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
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  remove: {
    borderColor: colors.danger,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.danger,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 48,
    padding: 14,
    textAlign: "center",
  },
});
