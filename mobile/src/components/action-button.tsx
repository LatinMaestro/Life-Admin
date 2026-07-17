import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { colors } from "@/lib/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function ActionButton({
  busy,
  icon,
  label,
  onPress,
  selected = false,
}: {
  busy?: boolean;
  icon: IconName;
  label: string;
  onPress: () => void;
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy, selected }}
      disabled={busy}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selected && styles.selected,
        pressed && styles.pressed,
        busy && styles.busy,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Ionicons color={selected ? "#FFFFFF" : colors.primary} name={icon} size={22} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { opacity: 0.7 },
  busy: { opacity: 0.6 },
});
