import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import { colors } from "@/lib/theme";

export function DateField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: Date) => void;
  value: Date;
}) {
  const [show, setShow] = useState(false);

  const changed = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShow(false);
    if (event.type === "set" && selected) onChange(selected);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityLabel={`Choose ${label.toLowerCase()}`}
        accessibilityRole="button"
        onPress={() => setShow((current) => !current)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {new Intl.DateTimeFormat(undefined, {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(value)}
        </Text>
      </Pressable>
      {show ? (
        <DateTimePicker
          display={Platform.OS === "ios" ? "inline" : "default"}
          minimumDate={new Date()}
          mode="date"
          onChange={changed}
          value={value}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  button: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 14,
  },
  buttonText: { color: colors.text, fontSize: 16 },
});
