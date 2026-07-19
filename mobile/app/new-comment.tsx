import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/primary-button";
import { StatusView } from "@/components/ui";
import { useApiResource, useHouseholdMutation } from "@/lib/api";
import type { ActivityResponse, CommentTarget } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export default function NewCommentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ entityType?: string; entityId?: string }>();
  const state = useApiResource<ActivityResponse>("/api/v1/activity");
  const mutate = useHouseholdMutation();
  const [selected, setSelected] = useState<CommentTarget | null>(null);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selected || !params.entityType || !params.entityId) return;
    const match = state.data?.targets.find(
      (target) =>
        target.entityType === params.entityType &&
        target.entityId === params.entityId,
    );
    if (match) setSelected(match);
  }, [params.entityId, params.entityType, selected, state.data?.targets]);

  const groups = useMemo(() => {
    const values = new Map<string, CommentTarget[]>();
    for (const target of state.data?.targets ?? []) {
      values.set(target.group, [...(values.get(target.group) ?? []), target]);
    }
    return [...values.entries()];
  }, [state.data?.targets]);

  const submit = async () => {
    if (!selected) {
      setMessage("Choose what you are commenting on.");
      return;
    }
    if (!body.trim()) {
      setMessage("Write a short comment.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await mutate(
        "/api/v1/activity",
        { entityType: selected.entityType, entityId: selected.entityId, body },
        "POST",
      );
      router.back();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Comment on</Text>
        <StatusView
          {...state}
          empty={Boolean(state.data) && groups.length === 0}
          onRetry={() => void state.refresh()}
        />
        {groups.map(([group, targets]) => (
          <View key={group} style={styles.group}>
            <Text style={styles.groupTitle}>{group}</Text>
            {targets.map((target) => {
              const isSelected =
                selected?.entityType === target.entityType && selected.entityId === target.entityId;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  key={target.entityType + target.entityId}
                  onPress={() => setSelected(target)}
                  style={[styles.target, isSelected && styles.targetSelected]}
                >
                  <Text numberOfLines={2} style={styles.targetLabel}>{target.label}</Text>
                  {isSelected ? <Ionicons color={colors.primary} name="checkmark-circle" size={22} /> : null}
                </Pressable>
              );
            })}
          </View>
        ))}
        <Text style={styles.label}>Comment</Text>
        <TextInput
          accessibilityLabel="Comment"
          maxLength={500}
          multiline
          onChangeText={setBody}
          placeholder="Add a helpful note for the household"
          placeholderTextColor={colors.muted}
          style={styles.input}
          textAlignVertical="top"
          value={body}
        />
        {message ? <Text accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null}
        <PrimaryButton
          busy={busy}
          disabled={!selected || !body.trim()}
          icon="checkmark"
          label="Add comment"
          onPress={() => void submit()}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  content: { gap: 14, padding: 18 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  group: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  groupTitle: {
    backgroundColor: colors.background,
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  target: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  targetSelected: { backgroundColor: "#EDF6F1" },
  targetLabel: { color: colors.text, flex: 1, fontSize: 15, lineHeight: 20 },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 110,
    padding: 14,
  },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
