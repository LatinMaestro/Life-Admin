import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Member } from "@/lib/contracts";
import { colors } from "@/lib/theme";

export function MemberField({
  members,
  onChange,
  value,
}: {
  members: Member[];
  onChange: (memberId: string) => void;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>Assigned to</Text>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {members.map((member) => {
          const selected = value === member.id;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={member.id}
              onPress={() => onChange(member.id)}
              style={[styles.option, selected && styles.selected]}
            >
              <Text numberOfLines={1} style={styles.name}>{member.displayName}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    maxWidth: "100%",
    paddingHorizontal: 13,
  },
  selected: { backgroundColor: "#EDF6F1", borderColor: colors.primary },
  name: { color: colors.text, fontSize: 14, fontWeight: "600" },
});
