import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "@/lib/theme";

export function PrimaryButton({
  busy = false,
  disabled = false,
  icon = "add",
  label,
  onPress,
}: {
  busy?: boolean;
  disabled?: boolean;
  icon?: "add" | "checkmark";
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy, disabled: busy || disabled }}
      disabled={busy || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        (busy || disabled) && styles.disabled,
      ]}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Ionicons color="#FFFFFF" name={icon} size={20} />
      )}
      <Text style={styles.label}>{busy ? "Saving..." : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16,
  },
  label: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  pressed: { backgroundColor: colors.primaryPressed },
  disabled: { opacity: 0.6 },
});
